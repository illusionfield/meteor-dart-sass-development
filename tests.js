import { Tinytest } from 'meteor/tinytest';

/*
Tinytest.add('Safe CallSite check - prevent Tinytest error', function (test) {
  try {
    test.expect_fail();
    test.equal(1,2, 'V8 stack API is available');
  } catch(err) {
    global.savedCaptureStackTrace = global.Error.captureStackTrace;
    global.Error.captureStackTrace = e => {
      if('string' === typeof e.stack) {
        e.stack = [];
      }
      global.Error.prepareStackTrace(e);
    }
    test.fail('V8 stack API is not available');
  }
});
*/

Tinytest.add('sass/scss - imports', function(test) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const prefixes = [ 'scss' ];

  try {
    const testPropertyName = 'border-top-style';

    const t = (className, style) => {
      for(let prefix of prefixes){
        div.className = `${prefix}-${className}`;

        // Read 'border-top-style' instead of 'border-style' (which is set
        // by the stylesheet) because only the individual styles are computed
        // and can be retrieved. Trying to read the synthetic 'border-style'
        // gives an empty string.
        const actualStyle = window.getComputedStyle(div, null).getPropertyValue(testPropertyName);
        test.equal(actualStyle, style,  div.className);
      }
    };

    t('el1', 'dotted');
    t('el2', 'dashed');
    t('el3', 'solid');
    t('el4', 'double');
    t('el5', 'groove');
    t('el6', 'inset');

    // This is assigned to 'ridge' in not-included.s(a|c)ss, which is ... not
    // included. So that's why it should be 'none'.  (This tests that we don't
    // process non-main files.)
    t('el0', 'none');
  } finally {
    document.body.removeChild(div);
  }
});


// Test for includePath
Tinytest.add('sass/scss - import from includePaths', function(test) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  try {
    div.className = 'from-include-paths';
    const actualStyle = window.getComputedStyle(div, null).getPropertyValue('border-bottom-style');
    test.equal(actualStyle, 'outset',  div.className);
  } finally {
    document.body.removeChild(div);
  }
});
