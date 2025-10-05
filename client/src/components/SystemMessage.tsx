interface SystemMessageProps {
  content: string;
  timestamp: Date;
}

const SystemMessage = ({ content, timestamp }: SystemMessageProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  return (
    <div className="flex justify-center my-3">
      <div className="bg-muted/50 px-3 py-1.5 rounded-full">
        <p className="text-xs text-muted-foreground">
          {content} • {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};

export default SystemMessage;
