var activeTestSuite = null;

function TestSuite(name) {
    this.name = name;
    this.beforeTest = function() {};
    this.currentTestName = '';
    this.failed = false;

    this.test = function(hasPassed) {
        if(hasPassed) {
            console.info('PASSED: ' + this.name + ' ' + this.currentTestName);
        } else {
            console.error('FAILED: ' + this.name + ' did not ' + this.currentTestName);
            this.failed = true;
        }
    };
}

function describe(name, action) {
    console.log('Running ' + name + ' Test Suite');
    activeTestSuite = new TestSuite(name);
    action();
    if(activeTestSuite.failed) {
        console.error(name + ' Test Suite FAILED');
    } else {
        console.info(name + ' Test Suite PASSED');
    }
}

function it(name, action) {
    console.log('Running ' + name + ' Test');
    activeTestSuite.currentTestName = name;
    activeTestSuite.beforeTest();
    action();
}

function beforeEach(action) {
    activeTestSuite.beforeTest = action;
}

function expect(obj) {
    return {
        toBe: function(value) {
            activeTestSuite.test(obj === value);
        },
        toNotBe: function(value) {
            activeTestSuite.test(obj !== value);
        }
    }
}
