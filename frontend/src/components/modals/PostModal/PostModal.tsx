import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { ModalWrapper } from "../ModelWrapper";
import { PostModalHeader } from "./PostModalHeader";
import { PostModalDates } from "./PostModalDates";
import { MAX_TITLE_LENGTH } from "../../../constants/constants";

/** 
PostModal component for creating, editing, or viewing a post. 

Props:
mode: create means creating a new post, edit means editing an existing post, view means read-only viewing
isOpen: whether the modal is open or not
userName: name of the user (for greeting in header)
post: the post object containing id, title, content, createdAt, updatedAt
onClose: Function to call when modal is closed
onSave: Optional function to call when saving a post (for create/edit modes)
onDelete: Optional function to call when deleting a post (for edit mode)
*/

interface PostModalProps {
  mode: "create" | "edit" | "view";
  isOpen: boolean;
  userName?: string;
  post?: {
    id?: number;
    title?: string | null;
    content?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  onClose: () => void;
  onSave?: (title: string, content: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export const PostModal: React.FC<PostModalProps> = ({
  mode,
  isOpen,
  userName,
  post,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

  const isReadOnly = mode === "view";
  const isEditable = mode === "edit" || mode === "create";

  const titleLen = title.length;
  const showTitleError = isEditable && title.trim().length === 0;

  useEffect(() => {
    if (!isOpen) {
      // Reset delete confirmation state when modal closes
      setIsDeleteConfirmed(false);
      return;
    }
    if (mode === "edit" || mode === "view") {
      setTitle(post?.title ?? "");
      setContent(post?.content ?? "");
    } else {
      setTitle("");
      setContent("");
    }
    // Reset delete confirmation state when modal opens
    setIsDeleteConfirmed(false);
  }, [isOpen, mode, post]);

  const handleDeleteClick = () => {
    if (!onDelete) return;

    if (!isDeleteConfirmed) {
      // First click - show confirmation state
      setIsDeleteConfirmed(true);
    } else {
      // Second click - delete post
      handleDelete();
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete();
      toast.success("Post deleted");
      onClose();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleSave = async () => {
    if (!onSave || !isEditable) return;

    // Reset delete confirmation state when saving
    setIsDeleteConfirmed(false);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // For edit mode: Check if anything actually changed
    if (mode === "edit" && post) {
      const originalTitle = (post.title ?? "").trim();
      const originalContent = (post.content ?? "").trim();

      if (trimmedTitle === originalTitle && trimmedContent === originalContent) {
        // No changes made, close the modal
        onClose();
        return;
      }
    }

    try {
      await onSave(trimmedTitle, trimmedContent);
      toast.success(mode === "create" ? "Post created" : "Post updated");
    } catch {
      toast.error("Failed to save post");
    }
  };

  const handleCancel = () => {
    // Reset delete confirmation state when canceling
    setIsDeleteConfirmed(false);
    onClose();
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      zIndex={600}
      panelClassName="relative bg-white rounded-lg shadow-xl p-6 sm:p-8 w-[480px] sm:w-[520px] md:w-[560px] lg:w-[600px] max-w-[92%] max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
    >
      <div className="flex-shrink-0">
        <PostModalHeader mode={mode} userName={userName} />
      </div>

      <div className="space-y-3 mt-4 overflow-y-auto flex-1 min-h-0">
        {/* ----- Title Field ----- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>

          {isReadOnly ? (
            <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 min-h-[42px] flex items-center">
              {title || <span className="text-gray-400 italic">No title</span>}
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={title}
                maxLength={MAX_TITLE_LENGTH}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write post title..."
                className="w-full border border-gray-300 rounded px-3 py-2 pr-14 focus:ring focus:ring-blue-200 outline-none"
              />

              <span
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${titleLen >= MAX_TITLE_LENGTH ? "text-red-500" : "text-gray-400"}`}
              >
                {titleLen}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          )}

          <div className="h-5 mt-1">
            {showTitleError && (
              <p className="text-xs text-gray-400">Title cannot be empty</p>
            )}
          </div>
        </div>

        {/* ----- Content Field ----- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          {isReadOnly ? (
            <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 min-h-[100px] max-h-[40vh] overflow-y-auto whitespace-pre-wrap break-words overflow-x-hidden custom-scrollbar">
              {content || <span className="text-gray-400 italic">No content</span>}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write post content..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200 outline-none resize-none min-h-[100px] max-h-[40vh] overflow-y-auto custom-scrollbar"
            />
          )}
        </div>

        {(mode === "edit" || mode === "view") && (
          <PostModalDates
            createdAt={post?.createdAt ?? undefined}
            updatedAt={post?.updatedAt ?? undefined}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 mt-5 flex-shrink-0">
        <button
          onClick={handleCancel}
          className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 text-sm font-medium"
        >
          {mode === "view" ? "Close" : "Cancel"}
        </button>

        {mode === "edit" && onDelete && (
          <button
            onClick={handleDeleteClick}
            className={`px-3 py-2 text-white rounded-md text-sm font-medium ${isDeleteConfirmed
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-500 hover:bg-red-600"
              }`}
          >
            {isDeleteConfirmed ? "Confirm Deletion" : "Delete"}
          </button>
        )}

        {isEditable && onSave && (
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${title.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-not-allowed"}`}
          >
            {mode === "create" ? "Post" : "Update"}
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};
