type RequestWindowOptions = {
  // Sets the initial width of the Picture-in-Picture window.
  width?: number;
  // Sets the initial height of the Picture-in-Picture window.
  height?: number;
  // Hides the "back to tab" button in the Picture-in-Picture window if true. It is false by default.
  disallowReturnToOpener?: boolean;
  //Open the Picture-in-Picture window in its default position and size if true. It is false by default.
  preferInitialWindowPlacement?: boolean;
};

type DocumentPictureInPicture = {
  requestWindow: (options?: RequestWindowOptions) => Promise<Window>;
  window: Window | null;
  onenter: unknown;
};

interface Window {
  documentPictureInPicture: DocumentPictureInPicture;
}
