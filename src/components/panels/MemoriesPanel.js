import React from 'react';

const MemoriesPanel = ({
  soulState,
  settings,
  longTermMemory,
  retrievedMemories,
  internalReflections,
  exportConversation,
  clearConversation
}) => {
  // Safely handle retrievedMemories
  const safeRetrieved = Array.isArray(retrievedMemories) ? retrievedMemories : [];

  // Normalize longTermMemory shapes:
  // older shape: longTermMemory = array
  // newer shape: longTermMemory = { rawText: [...], metadata: [...] }
  const hasRawTextObject = longTermMemory && typeof longTermMemory === 'object' && Array.isArray(longTermMemory.rawText);
  const longTermArray = hasRawTextObject ? longTermMemory.rawText : (Array.isArray(longTermMemory) ? longTermMemory : []);

  return (
    <div className="memories-panel">
      {/* Retrieved Memories Section */}
      {safeRetrieved.length > 0 && (
        <div className="retrieved-memory-section">
          <h3>Contextually Retrieved Memories (Last Query)</h3>
          <p className="memory-explanation">
            These are the most relevant long-term memories AION recalled to answer your last question.
          </p>
          {safeRetrieved.map((mem, index) => (
            <div key={index} className="memory-item retrieved">
              <div className="memory-time">
                Retrieved with score: {mem?.score ? mem.score.toFixed(4) : "N/A"}
              </div>
              <pre className="memory-content">{mem?.text ?? "(empty memory)"}</pre>
            </div>
          ))}
        </div>
      )}

      {/* Short-Term Memory */}
      <h3>Short-Term Memory (Last 100 Interactions)</h3>
      <div className="memory-list">
        {soulState?.memories?.slice()?.reverse()?.map((memory, index) => (
          <div key={index} className="memory-item">
            <div className="memory-time">{memory?.time ?? "Unknown time"}</div>
            <div className="memory-content">
              <div className="memory-question">{memory?.question ?? "(no question)"}</div>
              <div className="memory-response">{memory?.response ?? "(no response)"}</div>
            </div>
            <div className="memory-mood">
              <span className={`mood-tag ${memory?.mood ?? "neutral"}`}>
                {memory?.mood ?? "neutral"}
              </span>
              {memory?.emotionalState?.happiness !== undefined && (
                <span className="emotion-tag">
                  Happy: {(memory.emotionalState.happiness * 100).toFixed(0)}%
                </span>
              )}
              {memory?.sentiment !== undefined && (
                <span
                  className={`sentiment-tag ${
                    memory.sentiment > 0
                      ? "positive"
                      : memory.sentiment < 0
                      ? "negative"
                      : "neutral"
                  }`}
                >
                  Sentiment: {memory.sentiment}
                </span>
              )}
            </div>
          </div>
        )) || <p>No short-term memories available.</p>}
      </div>

      {/* Long-Term Memory */}
      {settings?.enableLongTermMemory && (
        <div className="long-term-memory-section">
          <h3>Full Long-Term Memory Log (Chronological)</h3>
          {longTermArray.length > 0 ? (
            longTermArray
              .slice()
              .reverse()
              .map((mem, index) => (
                <div key={index} className="memory-item">
                  <div className="memory-time">
                    {hasRawTextObject
                      ? (longTermMemory?.metadata?.slice().reverse()[index]?.timestamp ?? "Unknown time")
                      : mem?.timestamp ?? "Unknown time"}
                  </div>
                  <pre className="memory-content">{typeof mem === 'string' ? mem : (mem?.text ?? "(empty memory)")}</pre>
                </div>
              ))
          ) : (
            <p>No long-term memories yet. Interact more to build them!</p>
          )}
        </div>
      )}

      {/* Internal Reflections */}
      {settings?.enableSelfReflection && (
        <div className="internal-reflections-section long-term-memory-section">
          <h3>Internal Reflections</h3>
          {internalReflections?.length > 0 ? (
            internalReflections
              .slice()
              .reverse()
              .map((reflection, index) => (
                <div key={index} className="memory-item">
                  <div className="memory-time">
                    {reflection?.timestamp ?? "Unknown time"}
                  </div>
                  <pre className="memory-content">
                    AION&apos;s thought: {reflection?.reflection ?? "(empty reflection)"}
                  </pre>
                </div>
              ))
          ) : (
            <p>
              No internal reflections yet. AION will reflect after significant
              interactions.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="memory-actions">
        <button className="memory-action-button" onClick={exportConversation}>
          Export Memories
        </button>
        <button className="memory-action-button danger" onClick={clearConversation}>
          Clear Memories
        </button>
      </div>
    </div>
  );
};

export default MemoriesPanel;