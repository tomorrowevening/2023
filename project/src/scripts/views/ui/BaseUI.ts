export default interface BaseUI {
  isOver: boolean;
  rollOver(): void;
  rollOut(): void;
  click: () => void;
}
