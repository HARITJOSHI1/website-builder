export type FuncReturnType<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;
