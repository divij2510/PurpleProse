// Google OAuth response type
interface GoogleCredentialResponse {
  credential: string;
  clientId: string;
  select_by: string;
}

// Add Google auth type to Window interface
interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        renderButton: (element: HTMLElement | null, options: any) => void;
        prompt: () => void;
        callback: (response: GoogleCredentialResponse) => void;
      };
    };
  };
}