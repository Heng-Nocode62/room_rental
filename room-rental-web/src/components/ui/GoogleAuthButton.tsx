import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

interface GoogleAuthButtonProps {
  onAuth: (credential: string) => void;
  onError?: () => void;
}

export default function GoogleAuthButton({ onAuth, onError }: GoogleAuthButtonProps) {
  const handleSuccess = (response: CredentialResponse) => {
    if (!response.credential) {
      onError?.();
      return;
    }
    onAuth(response.credential);
  };

  return (
    <div className="mt-4 flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.()}
        text="continue_with"
        width="336"
      />
    </div>
  );
}