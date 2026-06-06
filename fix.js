const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

const regex = /setQuantumState\(quantumSimulator\.getCircuit\("consciousness"\)\.toString\(\)\);\s*\{\/\* Ambient animated backgrounds/;

const correctStr = `setQuantumState(quantumSimulator.getCircuit("consciousness").toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'soul':
        return <SoulPanel soulState={soulState} performMeditation={performMeditation} tellStory={tellStory} expressFeeling={expressFeeling} settings={settings} giveFeedback={giveFeedback} />;
      case 'memories':
        return (
          <MemoriesPanel 
            soulState={soulState}
            settings={settings}
            longTermMemory={longTermMemory}
            internalReflections={internalReflections}
            exportConversation={handleRegenerate}
            clearConversation={clearConversation}
          />
        );
      case 'search':
        const handleNewSearch = (query) => {
          setUserInput(\`research \${query}\`);
          askAion(\`research \${query}\`);
        };
        return <SearchPanel 
          agentStatus={agentStatus}
          searchPlan={searchPlan}
          thoughtProcessLog={thoughtProcessLog}
          suggestedQueries={suggestedQueries}
          searchSummary={searchSummary}
          searchError={searchError}
          isSearching={isSearching}
          onSearch={handleNewSearch}
          searchResults={searchResults}
        />;
      case 'math':
        return <MathPanel 
          isMathQuery={isMathQuery}
          mathSolution={mathSolution}
          userInput={userInput}
          onAsk={askAion}
        />;
      case 'quantum':
        return <QuantumPanel quantumState={quantumState} />;
      case 'neural':
        return <NeuralPanel neuralOutput={neuralOutput} />;
      case 'creative':
        return <CreativePanel 
          creativeOutput={creativeOutput} 
          generatedImage={generatedImage} 
          isImageGenerating={isImageGenerating} 
          generatedVideo={generatedVideo}
          isVideoGenerating={isVideoGenerating}
        />;
      case 'goals':
        return <GoalsPanel />;
      case 'knowledge':
        return <KnowledgePanel />;
      case 'fileUpload':
        return <FileUploadPanel />;
      case 'procedures':
        return <ProceduresPanel />;
      case 'status':
        return <StatusPanel systemStatus={systemStatus} />;
      case 'webcache':
        return null;
      case 'workspace':
        return <WorkspaceHomePanel setTab={setActiveTab} />;
      case 'projectIntelligence':
        return <ProjectIntelligencePanel />;
      case 'upgradeAgent':
        return <UpgradeAgentPanel />;
      case 'history':
        return <ConversationHistoryPanel />;
      case 'taskScheduler':
        return <TaskSchedulerPanel />;
      case 'localModelStatus':
        return <LocalModelStatusPanel />;
      case 'systemActivity':
        return <SystemActivityPanel />;
      case 'chat':
      default:
        return <ChatPanel 
          chatContainerRef={chatContainerRef}
          conversationHistory={conversationHistory}
          reply={reply}
          soulState={soulState} 
          sentimentScore={sentimentScore}
          isThinking={isThinking}
          isStreaming={isStreaming}
          streamingResponse={streamingResponse}
          onSpeak={speak}
          onRegenerate={handleRegenerate} 
          onCancel={() => abortController && abortController.abort()}
          onExamplePrompt={handleExamplePromptClick}
          onEditMessage={onEditMessage}
          onFeedback={onFeedback}
          uploadedFiles={uploadedFiles}
          onInsertFile={(f) => { setUserInput(prev => prev + \` [file:\${f.name}]\`); setNotification({ message: \`Inserted \${f.name}\` }); }}
          onOpenFile={(f) => { try { const url = f.url || f.analysis?.remote?.url; if (url) window.open(url, '_blank'); else setNotification({ message: 'No URL available for this file' }); } catch(e){ console.error(e); } }}
          onFilesSelected={(files) => handleFilesSelected(files)}
          onSend={handleChatPanelSend}
          onSaveToIndex={handleSaveToIndex}
          offlineHelpers={offlineHelpers}
        />;
    }
  };

  return (
    <div className={\`app-container \${settings.theme}-theme \${settings.energySaver ? 'energy-saver' : ''} palette-\${settings.palette || 'cyan'}\`}>
      {/* Ambient animated backgrounds`;

if (regex.test(code)) {
    code = code.replace(regex, correctStr);
    fs.writeFileSync('src/App.js', code);
    console.log("Fixed App.js successfully!");
} else {
    console.log("Could not find regex in App.js!");
}
