// Renders the modal header based on mode (create, edit, or view)
export const PostModalHeader = ({
  mode,
  userName,
}: {
  mode: string;
  userName?: string;
}) => {
  // Header for Create mode
  if (mode === "create")
    return (
      <h2 className="text-xl font-semibold text-gray-900 text-center">
        Hello, <span className="text-cyan-600 font-bold italic">{userName}</span>! Add a post!
      </h2>
    );

  // Header for Edit mode
  if (mode === "edit")
    return (
      <h2 className="text-xl font-semibold text-gray-900 text-center">
        Hello, <span className="text-cyan-600 font-bold italic">{userName}</span>! Edit your post!
      </h2>
    );

  // Default header for View-only mode
  return (
    <h2 className="text-xl font-semibold text-gray-900 text-center">
      <span className="text-cyan-600 font-bold italic">{userName}</span>&apos;s Post
    </h2>
  );
};
