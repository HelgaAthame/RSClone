export default interface ActiveBomb {
  curBomb: NodeJS.Timeout;
  bombTimer: number;
  bombX: number;
  bombY: number;
  isSuperBomb: boolean;
}
