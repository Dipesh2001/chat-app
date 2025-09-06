interface TypingIndicatorProps {
  avatar?: string;
}

const TypingIndicator = ({ avatar }: TypingIndicatorProps) => {
  return (
    <div className="flex items-end space-x-2">
      <img
        src={
          avatar ||
          "https://placehold.co/200x/ffa8e4/ffffff.svg?text=U&font=Lato"
        }
        alt="Typing user"
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="bg-chat-bubble-received border border-chat-bubble-received-border px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
