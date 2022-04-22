process.on('unhandledRejection', console.log)

const methods = ['log', 'warn']

// methods.forEach(function(method) {
//   console.log(method)
//   var old = console[method];
//   console[method] = function() {
//     var stack = (new Error()).stack.split(/\n/);
//     // Chrome includes a single "Error" line, FF doesn't.
//     if (stack[0].indexOf('Error') === 0) {
//       stack = stack.slice(1);
//     }
//     var args = [].slice.apply(arguments).concat([stack[1].trim()]);
//     return old.apply(console, args);
//   };
// });

global.c = {
  l : console.log
};
