import moment from "moment";

// Displays formatted 'Created on' and 'Last updated' timestamps inside PostModal 
export const PostModalDates = ({
  createdAt,
  updatedAt,
}: {
  createdAt?: string;
  updatedAt?: string;
}) => (
  <div className="mt-4 text-[12px] text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
    <p>
      <span className="text-gray-700 font-medium">Created on</span>{" "}
      <b><i>{moment(createdAt).format("MMM D, YYYY [at] h:mm A")}</i></b>
    </p>
    <p>
      <span className="text-gray-700 font-medium">Last updated at</span>{" "}
      <b><i>{moment(updatedAt).format("MMM D, YYYY [at] h:mm A")}</i></b>
    </p>
  </div>
);
