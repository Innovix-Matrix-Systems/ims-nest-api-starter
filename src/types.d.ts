interface DataTransformer<T, R> {
  transform(entity: T): R;
  transformMany(entities: T[]): R[];
}
