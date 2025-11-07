import React, { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { createPortal } from "react-dom";
import { Expand } from "lucide-react";

import {
  GetUsersDocument,
  UpdatePostDocument,
  DeletePostDocument,
  type GetUsersQuery,
  type UpdatePostMutation,
  type UpdatePostMutationVariables,
  type DeletePostMutation,
  type DeletePostMutationVariables,
} from "../../../__generated__/graphql";

import { PostModal } from "../../modals/PostModal";

/*
Type extraction for Post from GetUsersQuery:
- GetUsersQuery["users"] → UsersConnection object (not an array!)
- UsersConnection["data"] → User[] array
- User["posts"] → Post[] array
- Extract Post type from the posts array

The correct path: users.data[0].posts[0]
We use [number] instead of [0] to get the array element type generically.
*/
type User = NonNullable<NonNullable<GetUsersQuery["users"]>["data"]>[number];
type Post = NonNullable<User["posts"]>[number];

interface PostsHoverCellProps {
  posts: Post[];
  userName?: string;
  wrapperClassName?: string; // Optional className for the wrapper div
}

export const PostsHoverCell: React.FC<PostsHoverCellProps> = ({ posts, userName, wrapperClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [updatePost] = useMutation<UpdatePostMutation, UpdatePostMutationVariables>(
    UpdatePostDocument,
    { refetchQueries: [{ query: GetUsersDocument }] }
  );

  const [deletePost] = useMutation<DeletePostMutation, DeletePostMutationVariables>(
    DeletePostDocument,
    { refetchQueries: [{ query: GetUsersDocument }] }
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const openPopover = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
    setIsOpen(true);
  }, []);

  const closePopover = useCallback(() => setIsOpen(false), []);
  // Delay to give time to move mouse to popover
  const scheduleClose = useCallback((delay = 100) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(closePopover, delay);
  }, [closePopover]);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);
  const togglePopover = useCallback(() => (isOpen ? closePopover() : openPopover()), [isOpen, closePopover, openPopover]);


  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popupRef.current?.contains(t)) {
        closePopover();
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePopover();
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closePopover]);

  if (!posts?.length) {
    return (
      <div className="inline-flex items-center justify-center w-8 h-7 rounded-md text-sm font-semibold select-none bg-gray-100 text-gray-400 border border-gray-200">
        0
      </div>
    );
  }

  const popupStyle: React.CSSProperties = (() => {
    const pad = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= 420;
    const width = mobile ? vw - pad * 2 : Math.min(320, vw - pad * 2);
    const estimatedHeight = 360;

    if (!anchorRect) {
      return { position: "fixed" as const, top: pad, left: pad, width, zIndex: 50 };
    }

    // Position directly adjacent to trigger (no gap) - prefer right side, then left
    let top = anchorRect.top; // Align top with trigger
    let left = anchorRect.right + 8; // Position to the right with small gap

    const roomRight = vw - left - pad;
    const roomBelow = vh - anchorRect.bottom - pad;
    const roomAbove = anchorRect.top - pad;

    // If not enough room on right, try left side
    if (roomRight < width) {
      left = anchorRect.left - width - 8;
      // If still not enough room on left, position below
      if (left < pad) {
        left = anchorRect.left;
        top = anchorRect.bottom + 2; // Minimal gap below
      }
    }

    // If positioned below and not enough room, position above
    if (top >= anchorRect.bottom && roomBelow < estimatedHeight && roomAbove > roomBelow) {
      top = anchorRect.top - estimatedHeight - 2; // Minimal gap above
      if (top < pad) {
        top = pad;
      }
    }

    // Ensure popover stays within viewport horizontally
    if (left + width > vw - pad) {
      left = vw - width - pad;
    }
    if (left < pad) {
      left = pad;
    }

    const maxHeight = Math.min(estimatedHeight, vh - Math.max(pad, top) - pad);

    return {
      position: "fixed",
      top,
      left,
      width,
      maxHeight,
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      zIndex: 50,
    };
  })();

  const handleSave = async (title: string, content: string) => {
    if (!selectedPost) return;
    try {
      await updatePost({
        variables: {
          input: {
            id: selectedPost.id,
            title,
            content,
          },
        },
      });
      setSelectedPost(null);
    } catch (err) {
      console.error("Error updating post:", err);
      // Error toast is shown by PostModal
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    try {
      await deletePost({ variables: { id: selectedPost.id } });
      setSelectedPost(null);
    } catch (err) {
      console.error("Error deleting post:", err);
      // Error toast is shown by PostModal
      throw err;
    }
  };

  // Create an invisible bridge covering the gap area between trigger and popover
  // This prevents hover break when moving mouse diagonally
  const bridgeStyle: React.CSSProperties | null = (() => {
    if (!isOpen || !anchorRect) return null;

    const popoverTop = popupStyle.top as number;
    const popoverLeft = popupStyle.left as number;
    const popoverHeight = popupStyle.maxHeight as number || 360;
    const popoverRight = popoverLeft + ((popupStyle.width as number) || 320);
    const popoverBottom = popoverTop + popoverHeight;

    const triggerTop = anchorRect.top;
    const triggerBottom = anchorRect.bottom;
    const triggerLeft = anchorRect.left;
    const triggerRight = anchorRect.right;

    // Check if popover is to the right, left, above, or below
    const isRight = popoverLeft >= triggerRight;
    const isLeft = popoverRight <= triggerLeft;
    const isBelow = popoverTop >= triggerBottom;
    const isAbove = popoverBottom <= triggerTop;

    if (isRight) {
      // Popover is to the right - create vertical bridge
      const gap = popoverLeft - triggerRight;
      const top = Math.min(triggerTop, popoverTop);
      const bottom = Math.max(triggerBottom, popoverBottom);
      return {
        position: "fixed" as const,
        top,
        left: triggerRight,
        width: gap,
        height: bottom - top,
        zIndex: 49,
        pointerEvents: "auto" as const,
      };
    } else if (isLeft) {
      // Popover is to the left - create vertical bridge
      const gap = triggerLeft - popoverRight;
      const top = Math.min(triggerTop, popoverTop);
      const bottom = Math.max(triggerBottom, popoverBottom);
      return {
        position: "fixed" as const,
        top,
        left: popoverRight,
        width: gap,
        height: bottom - top,
        zIndex: 49,
        pointerEvents: "auto" as const,
      };
    } else if (isBelow) {
      // Popover is below - create horizontal bridge
      const gap = popoverTop - triggerBottom;
      const left = Math.min(triggerLeft, popoverLeft);
      const right = Math.max(triggerRight, popoverRight);
      return {
        position: "fixed" as const,
        top: triggerBottom,
        left,
        width: right - left,
        height: gap,
        zIndex: 49,
        pointerEvents: "auto" as const,
      };
    } else if (isAbove) {
      // Popover is above - create horizontal bridge
      const gap = triggerTop - popoverBottom;
      const left = Math.min(triggerLeft, popoverLeft);
      const right = Math.max(triggerRight, popoverRight);
      return {
        position: "fixed" as const,
        top: popoverBottom,
        left,
        width: right - left,
        height: gap,
        zIndex: 49,
        pointerEvents: "auto" as const,
      };
    }

    // If overlapping or adjacent, no bridge needed
    return null;
  })();

  const popover =
    isOpen && anchorRect
      ? createPortal(
        <>
          {/* Invisible bridge to prevent hover break */}
          {bridgeStyle && (
            <div
              style={bridgeStyle}
              onMouseEnter={cancelClose}
              onMouseLeave={() => scheduleClose(100)}
              className="pointer-events-auto"
            />
          )}
          <div
            ref={popupRef}
            className="bg-white border border-gray-200 shadow-xl rounded-lg p-4 custom-scrollbar"
            style={popupStyle}
            onMouseEnter={cancelClose}
            onMouseLeave={() => scheduleClose(100)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-gray-700">
                {posts.length} {posts.length === 1 ? "Post" : "Posts"}
              </h4>
              <button
                className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                onClick={closePopover}
              >
                Close
              </button>
            </div>
            <hr className="border-gray-200 mb-3" />

            <ul className="space-y-3 pr-2">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="border border-gray-100 rounded-md p-3 hover:bg-gray-50 transition-colors duration-150 flex justify-between items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium text-sm truncate">
                      {post.title ?? "Untitled"}
                    </p>
                    <p className="text-gray-600 text-xs leading-snug mt-1">
                      {post.content
                        ? post.content.length > 80
                          ? post.content.slice(0, 80) + "..."
                          : post.content
                        : "No content available."}
                    </p>
                  </div>

                  <button
                    className="p-1 text-gray-500 hover:text-blue-600 transition shrink-0"
                    onClick={() => {
                      setSelectedPost(post);
                      closePopover();
                    }}
                  >
                    <Expand size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>,
        document.body
      )
      : null;


  return (
    <div className={wrapperClassName ?? "inline-block text-center"}>
      <div
        ref={triggerRef}
        className="inline-flex items-center justify-center w-8 h-7 rounded-md text-sm font-semibold select-none
    bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 cursor-pointer transition"
        onMouseEnter={() => {
          cancelClose();
          openPopover();
        }}
        onMouseLeave={() => scheduleClose(100)}
        onClick={togglePopover}
      >
        {posts.length}
      </div>

      {popover}

      <PostModal
        mode="edit"
        isOpen={!!selectedPost}
        userName={userName}
        post={selectedPost ? {
          id: selectedPost.id,
          title: selectedPost.title,
          content: selectedPost.content,
          createdAt: selectedPost.createdAt,
          updatedAt: selectedPost.updatedAt,
        } : undefined}
        onClose={() => setSelectedPost(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};
