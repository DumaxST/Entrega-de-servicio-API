/**
 * Entidad SystemStats
 *
 * Representa el documento singleton que almacena estadísticas globales
 * de toda la plataforma, evitando consultas costosas.
 *
 * @pattern Singleton Document
 * @collection systemStats
 * @document main
 */

export class SystemStatsEntity {
  /**
   * Constructor privado para forzar el uso del método factory
   */
  private constructor(
    public readonly totalGlobalUnits: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Factory method para crear una instancia desde datos raw de Firestore
   *
   * @param object - Objeto con los datos del documento
   * @returns Instancia de SystemStatsEntity
   */
  public static fromObject(object: {
    [key: string]: any;
  }): SystemStatsEntity {
    const {
      totalGlobalUnits,
      createdAt,
      updatedAt,
    } = object;

    // Validaciones básicas
    if (totalGlobalUnits === undefined || totalGlobalUnits === null) {
      throw new Error("totalGlobalUnits es requerido");
    }

    if (typeof totalGlobalUnits !== "number") {
      throw new Error("totalGlobalUnits debe ser un número");
    }

    if (totalGlobalUnits < 0) {
      throw new Error("totalGlobalUnits no puede ser negativo");
    }

    return new SystemStatsEntity(
      totalGlobalUnits,
      createdAt?.toDate?.() || createdAt,
      updatedAt?.toDate?.() || updatedAt
    );
  }

  /**
   * Convierte la entidad a un objeto plano para Firestore
   *
   * @returns Objeto plano con los datos de la entidad
   */
  public toObject(): {
    totalGlobalUnits: number;
    updatedAt: Date;
  } {
    return {
      totalGlobalUnits: this.totalGlobalUnits,
      updatedAt: new Date(),
    };
  }

  /**
   * Incrementa el contador de unidades globales
   *
   * @param amount - Cantidad a incrementar (puede ser negativo para decrementar)
   * @returns Nueva instancia con el valor actualizado
   */
  public incrementUnits(amount: number): SystemStatsEntity {
    const newTotal = this.totalGlobalUnits + amount;

    if (newTotal < 0) {
      throw new Error(
        `No se puede decrementar: el resultado sería negativo (${newTotal})`
      );
    }

    return new SystemStatsEntity(
      newTotal,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Getter: Indica si hay unidades registradas en el sistema
   */
  public get hasUnits(): boolean {
    return this.totalGlobalUnits > 0;
  }

  /**
   * Getter: Retorna el total de unidades formateado
   */
  public get formattedTotal(): string {
    return this.totalGlobalUnits.toLocaleString("es-MX");
  }
}
