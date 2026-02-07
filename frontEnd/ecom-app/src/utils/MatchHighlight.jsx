import React from "react";
const MatchHighlight = (text, query) => {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const startIndex = lowerText.indexOf(lowerQuery);

  if (startIndex === -1) return text;

  const before = text.slice(0, startIndex);
  const match = text.slice(startIndex, startIndex + query.length);
  const after = text.slice(startIndex + query.length);

  return (
    <>
      {before}
      <span className="highlight">{match}</span>
      {after}
    </>
  );
};
export default MatchHighlight