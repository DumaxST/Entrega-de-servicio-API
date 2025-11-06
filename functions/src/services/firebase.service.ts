import { db } from "config/firebaseAdmin";

import {
    CollectionReference,
    DocumentData,
    FieldValue,
    Query,
    WhereFilterOp,
} from "firebase-admin/firestore";

export interface QueryFilter {
    field: string;
    op: FirebaseFirestore.WhereFilterOp;
    value: any;
}
export interface PaginationOptions {
    limit: number;
    orderBy: string;
    orderDir: 'asc' | 'desc';
    cursor?: string; // El ID del último documento
}
/** Filtro where individual: ["status", "==", "active"] */
export type WhereTriplet = [field: string, op: WhereFilterOp, value: any];

/** Define cómo ordenar: ["createdAt", "desc"] */
export type OrderByTuple = [field: string, direction: "asc" | "desc"];

export type PaginatedResult<T> = {
    documents: (T & { id: string })[];
    newLastDocId: string | null;
};

export class FirebaseService<T extends { id: string }> {
    protected collection: CollectionReference<DocumentData>;

    constructor(collectionPath: string) {
        this.collection = db.collection(collectionPath);

    }
    /**
   * Obtiene un documento por su ID.
   */
    async getById(id: string): Promise<T | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() } as T;
    }

    /**
     * Crea un nuevo documento.
     */
    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<T> {
        const dataWithTimestamps = {
            ...data,
            createdAt: FieldValue.serverTimestamp(), 
            updatedAt: FieldValue.serverTimestamp(),
        };

        if (id) {
            await this.collection.doc(id).set(dataWithTimestamps);
            return { id, ...data } as T;
        } else {
            const docRef = await this.collection.add(dataWithTimestamps);
            return { id: docRef.id, ...data } as T;
        }
    }

    /**
     * Actualiza un documento existente.
     */
    async update(id: string, data: Partial<T>): Promise<T | null> {
        const dataWithTimestamp = {
            ...data,
            updatedAt: FieldValue.serverTimestamp(), 
        };

        await this.collection.doc(id).update(dataWithTimestamp);
        return this.getById(id);
    }

    /**
     * Elimina un documento.
     */
    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }

    /**
     * Obtiene documentos con paginación, filtros múltiples y orden múltiple.
     */
    async getPaginatedDocuments(
        options: {
            filters?: WhereTriplet[];
            orderBy?: OrderByTuple[];
            limit: number;
            lastDocId?: string; // El cursor
        }
    ): Promise<PaginatedResult<T>> {

        // 1. Inicia la consulta desde la colección de la clase
        let q: Query = this.collection; 
        const { filters = [], orderBy = [], limit, lastDocId } = options;

        // 2. Aplica filtros
        filters.forEach((f) => {
            q = q.where(f[0], f[1], f[2]);
        });

        // 3. Aplica orden
        orderBy.forEach((o) => {
            q = q.orderBy(o[0], o[1]);
        });

        // 4. Aplica el cursor de paginación
        if (lastDocId) {
            const lastDoc = await this.collection.doc(lastDocId).get();
            if (lastDoc.exists) {
                q = q.startAfter(lastDoc);
            }
        }

        // 5. Aplica límite
        q = q.limit(limit);

        // 6. Ejecuta la consulta
        const snap = await q.get();

        // 7. Mapea los resultados
        const documents = snap.docs.map((d) => ({
            ...(d.data() as T),
            id: d.id,
        }));

        // 8. Determina el siguiente cursor
        const newLastDocId =
            snap.docs.length === limit ? snap.docs[snap.docs.length - 1].id : null;

        return { documents, newLastDocId };
    }
}