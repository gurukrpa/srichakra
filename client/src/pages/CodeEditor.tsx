import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayIcon, XIcon } from "lucide-react";

// Initial code content
const initialCode = `(function() {
    /*
     Copyright The Closure Library Authors.
     SPDX-License-Identifier: Apache-2.0
    */
    /*
     Copyright Google LLC
     SPDX-License-Identifier: Apache-2.0
    */
    'use strict';
    var aa = "-t-k0-und", ba = "Android", ca = "Edge", da = "IFRAME", l = "INPUT", ea = "Invalid event type";
    
    const Ya = function() {
        var a = typeof globalThis;
        a = [a === "object" && globalThis, a, typeof window === "object" && window, 
             typeof self === "object" && self, typeof global === "object" && global];
        for (var b = 0; b < a.length; ++b) {
            var c = a[b];
            if (c && c.Math == Math)
                return c
        }
        throw Error("Cannot find global object");
    };
    
    const $a = function(a, b) {
        if (b) {
            var c = Ya;
            a = a.split(".");
            for (var d = 0; d < a.length - 1; d++) {
                var e = a[d];
                if (!(e in c))
                    break;
                c = c[e]
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && b != null && Object.defineProperty(c, a, {
                configurable: !0,
                writable: !0,
                value: b
            })
        }
    };
    
    const F = function(a, b) {
        this.x = a !== void 0 ? a : 0;
        this.y = b !== void 0 ? b : 0
    };
    
    // Example of creating a point object 
    const createPoint = function(x, y) {
        return new F(x, y);
    };
    
    // Function to test the closure library
    function testClosureLibrary() {
        // Create a point
        const point = createPoint(10, 20);
        
        // Log the point
        console.log("Created point:", point);
        
        // Test the global object finder
        const globalObj = Ya();
        console.log("Global object found:", globalObj === window);
        
        return {
            point: point,
            globalObjectMatches: globalObj === window
        };
    }
    
    // Make test function available globally
    window.testClosureLibrary = testClosureLibrary;
})();`;

interface ConsoleEntry {
  message: string;
  type: 'log' | 'error' | 'warn' | 'info';
  id: number;
}

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>(initialCode);
  const [consoleOutput, setConsoleOutput] = useState<ConsoleEntry[]>([]);
  const [nextEntryId, setNextEntryId] = useState<number>(0);
  const codeEditorRef = useRef<HTMLPreElement>(null);

  // Function to append to output console
  const appendToOutput = (message: any, type: 'log' | 'error' | 'warn' | 'info' = 'log') => {
    let formattedMessage: string;
    
    if (typeof message === 'object') {
      try {
        formattedMessage = JSON.stringify(message, null, 2);
      } catch (e) {
        formattedMessage = String(message);
      }
    } else {
      formattedMessage = String(message);
    }
    
    setConsoleOutput(prev => [
      ...prev, 
      { message: formattedMessage, type, id: nextEntryId }
    ]);
    
    setNextEntryId(prev => prev + 1);
  };

  // Override console methods
  const overrideConsole = () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = function(...args) {
      originalLog.apply(console, args);
      args.forEach(arg => appendToOutput(arg, 'log'));
    };

    console.error = function(...args) {
      originalError.apply(console, args);
      args.forEach(arg => appendToOutput(arg, 'error'));
    };

    console.warn = function(...args) {
      originalWarn.apply(console, args);
      args.forEach(arg => appendToOutput(arg, 'warn'));
    };

    console.info = function(...args) {
      originalInfo.apply(console, args);
      args.forEach(arg => appendToOutput(arg, 'info'));
    };

    return { originalLog, originalError, originalWarn, originalInfo };
  };

  // Restore original console
  const restoreConsole = (original: { 
    originalLog: typeof console.log;
    originalError: typeof console.error;
    originalWarn: typeof console.warn;
    originalInfo: typeof console.info;
  }) => {
    console.log = original.originalLog;
    console.error = original.originalError;
    console.warn = original.originalWarn;
    console.info = original.originalInfo;
  };

  // Run code function
  const runCode = () => {
    clearOutput();
    
    const original = overrideConsole();
    
    try {
      // Add timestamp to output
      appendToOutput(`// Execution started at ${new Date().toLocaleTimeString()}`, 'info');
      
      // Create and execute code in a safe way
      const executeScript = new Function(code);
      executeScript();
      
      // If the code exposes a test function, run it
      if (typeof (window as any).testClosureLibrary === 'function') {
        const result = (window as any).testClosureLibrary();
        appendToOutput('// Test function executed successfully', 'info');
        appendToOutput(result);
      }
      
      appendToOutput(`// Execution completed at ${new Date().toLocaleTimeString()}`, 'info');
    } catch (error) {
      if (error instanceof Error) {
        appendToOutput(`Error: ${error.message}`, 'error');
        if (error.stack) {
          appendToOutput(`Stack: ${error.stack}`, 'error');
        }
      } else {
        appendToOutput(`Unknown error occurred`, 'error');
      }
    } finally {
      restoreConsole(original);
    }
  };

  // Clear output function
  const clearOutput = () => {
    setConsoleOutput([]);
  };

  // Clear code function
  const clearCode = () => {
    if (window.confirm('Are you sure you want to clear the code editor?')) {
      setCode('');
    }
  };

  // Handle tab key in code editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && document.activeElement === codeEditorRef.current) {
        e.preventDefault();
        document.execCommand('insertText', false, '    ');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle code changes
  const handleCodeChange = (e: React.FormEvent<HTMLPreElement>) => {
    if (codeEditorRef.current) {
      setCode(codeEditorRef.current.textContent || '');
    }
  };

  // Get CSS class for console entry based on type
  const getConsoleEntryClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'warn':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-2xl md:text-3xl font-bold">Closure Library Execution Environment</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Interactive environment for executing and testing closure library code
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl flex-grow py-6 px-4">
        {/* Code Editor Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Code Editor</h2>
            <div className="flex space-x-2">
              <Button 
                onClick={runCode}
                className="bg-[#4A90E2] hover:bg-[#3A80D2] text-white"
              >
                <PlayIcon className="h-4 w-4 mr-2" /> Run Code
              </Button>
              <Button
                onClick={clearCode}
                variant="outline"
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300"
              >
                Clear
              </Button>
            </div>
          </div>
          
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
              <span className="font-medium text-sm">closure-library.js</span>
              <div className="flex space-x-1">
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1 text-sm"
                  onClick={() => navigator.clipboard.writeText(code)}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="relative">
              <pre 
                ref={codeEditorRef}
                className="h-96 overflow-auto bg-[#F8F9FA] p-4 font-mono text-sm whitespace-pre-wrap" 
                contentEditable={true} 
                spellCheck={false}
                onInput={handleCodeChange}
                suppressContentEditableWarning={true}
              >
                {code}
              </pre>
            </div>
          </Card>
        </section>

        {/* Output Console Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Output Console</h2>
            <button 
              className="text-sm text-gray-600 hover:text-[#4A90E2] transition-colors"
              onClick={clearOutput}
            >
              Clear Output
            </button>
          </div>
          
          <Card className="overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <span className="font-medium text-sm">Console Output</span>
            </div>
            <div className="p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto">
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500 italic">
                  // Output will appear here after running the code
                </div>
              ) : (
                consoleOutput.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`my-1 border-l-4 pl-2 py-1 ${getConsoleEntryClass(entry.type)}`}
                  >
                    {entry.message}
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} JavaScript Closure Library Environment
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-[#4A90E2] transition-colors">Documentation</a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#4A90E2] transition-colors">GitHub</a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#4A90E2] transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodeEditor;
