interface DateSeparatorProps {
  date: Date;
}

const DateSeparator = ({ date }: DateSeparatorProps) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 border-t border-border"></div>
      <div className="px-4 py-1 bg-muted rounded-full">
        <span className="text-xs font-medium text-muted-foreground">
          {formatDate(date)}
        </span>
      </div>
      <div className="flex-1 border-t border-border"></div>
    </div>
  );
};

export default DateSeparator;
