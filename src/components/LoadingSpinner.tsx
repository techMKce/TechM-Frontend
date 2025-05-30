export default function LoadingSpinner() {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-56 h-56 border border-t-transparent border-border rounded-full animate-spin" />
      </div>
    );
  }
  