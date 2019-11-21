let log = {
  info: function info(message) {
    // const callerInfo = getFileName(info.caller.name);
    const callerInfo = getFileName();
    console.log(
      arguments.callee.name.toUpperCase() +
        " | " +
        callerInfo.filename +
        " >> " +
        info.caller.name +
        "() | " +
        message
    );
  }
};

function getFileName() {
  const STACK_FUNC_NAME = new RegExp(/at\s+((\S+)\s)?\((\S+):(\d+):(\d+)\)/);
  let err = new Error();

  Error.captureStackTrace(err);

  let stacks = err.stack.split("\n").slice(1);

  let callerInfo = null;
  for (let i = 0; i < stacks.length; i++) {
    callerInfo = STACK_FUNC_NAME.exec(stacks[i]);
    console.log(callerInfo, callerInfo[2]);
    if (callerInfo[2].startsWith("Object..")) {
      console.log(`All Good`);
      return {
        filename: callerInfo[2]
      };
    }
  }

  return null;
}

function iWantToLog() {
  log.info("Testing my log");
}

iWantToLog();
