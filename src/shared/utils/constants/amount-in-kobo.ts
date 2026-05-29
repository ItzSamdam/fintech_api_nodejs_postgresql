// amount-in-kobo.ts

export class AmountInKobo {
  private readonly valueInKobo: number;

  constructor(value: number) {
    // Store as integer (kobo)
    this.valueInKobo = Math.round(value);
  }

  // Get raw kobo value (for database storage)
  get kobo(): number {
    return this.valueInKobo;
  }

  // Convert to naira as float
  toNaira(): number {
    return this.valueInKobo / 100;
  }

  // Factory: create from naira (float)
  static fromNaira(amount: number): AmountInKobo {
    return new AmountInKobo(Math.round(amount * 100));
  }

  // Factory: create from kobo (int)
  static fromKobo(kobo: number): AmountInKobo {
    return new AmountInKobo(kobo);
  }

  // For serialization to JSON (shows naira for API responses)
  toJSON(): number {
    return this.toNaira();
  }

  // Enable arithmetic (optional)
  add(other: AmountInKobo): AmountInKobo {
    return new AmountInKobo(this.valueInKobo + other.valueInKobo);
  }

  subtract(other: AmountInKobo): AmountInKobo {
    return new AmountInKobo(this.valueInKobo - other.valueInKobo);
  }

  // Compare
  equals(other: AmountInKobo): boolean {
    return this.valueInKobo === other.valueInKobo;
  }
}