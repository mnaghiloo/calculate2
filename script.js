document.addEventListener('DOMContentLoaded', () => {
    const display = {
        result: document.querySelector('.result'),
        history: document.querySelector('.history')
    };
    
    let state = {
        currentValue: '0',
        previousValue: null,
        operator: null,
        waitingForOperand: false,
        memory: 0,
        angleMode: 'deg' // 'deg' or 'rad'
    };
    
    // Constants
    const MAX_DISPLAY_LENGTH = 15;
    
    // Helper Functions
    function updateDisplay() {
        let displayValue = state.currentValue;
        
        // Format display for better readability
        if (displayValue.includes('.')) {
            const [integerPart, decimalPart] = displayValue.split('.');
            const formattedIntegerPart = Number(integerPart).toLocaleString('en-US', {
                maximumFractionDigits: 0
            });
            displayValue = formattedIntegerPart + '.' + decimalPart;
        } else {
            displayValue = Number(displayValue).toLocaleString('en-US', {
                maximumFractionDigits: 0
            });
        }
        
        // Handle number display size
        const num = Number(state.currentValue);
        
        // Use scientific notation for very large/small numbers
        if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-7 && num !== 0)) {
            displayValue = num.toExponential(6);
        }
        
        // Dynamically adjust font size based on length
        const resultDisplay = display.result;
        if (displayValue.length > 12) {
            resultDisplay.style.fontSize = '32px';
        } else if (displayValue.length > 9) {
            resultDisplay.style.fontSize = '38px';
        } else {
            resultDisplay.style.fontSize = '';  // Reset to default from CSS
        }
        
        display.result.textContent = displayValue;
    }
    
    function updateHistory() {
        if (state.previousValue && state.operator) {
            const operatorSymbol = getOperatorSymbol(state.operator);
            display.history.textContent = `${state.previousValue} ${operatorSymbol}`;
        } else {
            display.history.textContent = '';
        }
    }
    
    function getOperatorSymbol(op) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷',
            'power': '^'
        };
        return symbols[op] || op;
    }
    
    function calculate() {
        if (!state.previousValue || !state.operator) return;
        
        const prev = parseFloat(state.previousValue);
        const current = parseFloat(state.currentValue);
        let result;
        
        switch (state.operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                result = prev / current;
                break;
            case 'power':
                result = Math.pow(prev, current);
                break;
            default:
                return;
        }
        
        // Handle cases like Infinity or NaN
        if (!isFinite(result)) {
            state.currentValue = result === Infinity ? 'Infinity' : 'Error';
        } else {
            state.currentValue = result.toString();
        }
        
        state.previousValue = null;
        state.operator = null;
        state.waitingForOperand = true;
        updateDisplay();
        updateHistory();
    }
    
    function handleNumberInput(number) {
        if (state.waitingForOperand) {
            state.currentValue = number;
            state.waitingForOperand = false;
        } else {
            state.currentValue = state.currentValue === '0' ? number : state.currentValue + number;
        }
        updateDisplay();
    }
    
    function handleOperator(operator) {
        const currentValue = state.currentValue;
        
        if (state.operator && !state.waitingForOperand) {
            calculate();
        } else if (state.waitingForOperand && state.operator) {
            state.operator = operator;
            updateHistory();
            return;
        }
        
        state.previousValue = currentValue;
        state.operator = operator;
        state.waitingForOperand = true;
        updateHistory();
    }
    
    function handleDecimal() {
        if (state.waitingForOperand) {
            state.currentValue = '0.';
            state.waitingForOperand = false;
        } else if (!state.currentValue.includes('.')) {
            state.currentValue += '.';
        }
        updateDisplay();
    }
    
    function handleClear() {
        state.currentValue = '0';
        state.previousValue = null;
        state.operator = null;
        state.waitingForOperand = false;
        updateDisplay();
        updateHistory();
    }
    
    function handlePlusMinus() {
        state.currentValue = (parseFloat(state.currentValue) * -1).toString();
        updateDisplay();
    }
    
    function handlePercent() {
        state.currentValue = (parseFloat(state.currentValue) / 100).toString();
        updateDisplay();
    }
    
    // Scientific functions
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    function toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    function handleScientificFunction(action) {
        let val = parseFloat(state.currentValue);
        let result;
        
        switch (action) {
            case 'rad':
                state.angleMode = 'rad';
                return;
            case 'deg':
                state.angleMode = 'deg';
                return;
            case 'sin':
                if (state.angleMode === 'deg') val = toRadians(val);
                result = Math.sin(val);
                break;
            case 'cos':
                if (state.angleMode === 'deg') val = toRadians(val);
                result = Math.cos(val);
                break;
            case 'tan':
                if (state.angleMode === 'deg') val = toRadians(val);
                result = Math.tan(val);
                break;
            case 'log':
                result = Math.log10(val);
                break;
            case 'ln':
                result = Math.log(val);
                break;
            case 'sqr':
                result = Math.pow(val, 2);
                break;
            case 'cube':
                result = Math.pow(val, 3);
                break;
            case 'power':
                handleOperator('power');
                return;
            case 'exp':
                result = Math.exp(val);
                break;
            case '10power':
                result = Math.pow(10, val);
                break;
            case 'factorial':
                if (val < 0 || val % 1 !== 0) {
                    result = NaN;
                } else {
                    result = 1;
                    for (let i = 2; i <= val; i++) result *= i;
                }
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'mc':
                state.memory = 0;
                return;
            case 'mplus':
                state.memory += parseFloat(state.currentValue);
                state.waitingForOperand = true;
                return;
            case 'mminus':
                state.memory -= parseFloat(state.currentValue);
                state.waitingForOperand = true;
                return;
            case 'mr':
                result = state.memory;
                break;
            default:
                return;
        }
        
        if (!isFinite(result)) {
            state.currentValue = 'Error';
        } else {
            state.currentValue = result.toString();
        }
        
        state.waitingForOperand = true;
        updateDisplay();
    }
    
    // Event Listeners
    const calculator = document.querySelector('.calculator');
    
    calculator.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.matches('.number')) {
            handleNumberInput(target.dataset.number);
        } else if (target.matches('.operator')) {
            handleOperator(target.dataset.action);
        } else if (target.matches('.decimal')) {
            handleDecimal();
        } else if (target.matches('.clear')) {
            handleClear();
        } else if (target.matches('.equals')) {
            calculate();
        } else if (target.matches('.function')) {
            handleScientificFunction(target.dataset.action);
        }
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            handleNumberInput(e.key);
        } else if (e.key === '.') {
            handleDecimal();
        } else if (e.key === '+') {
            handleOperator('add');
        } else if (e.key === '-') {
            handleOperator('subtract');
        } else if (e.key === '*') {
            handleOperator('multiply');
        } else if (e.key === '/') {
            e.preventDefault(); // Prevent browser's find feature
            handleOperator('divide');
        } else if (e.key === '^') {
            handleOperator('power');
        } else if (e.key === 'Enter' || e.key === '=') {
            calculate();
        } else if (e.key === 'Escape') {
            handleClear();
        } else if (e.key === '%') {
            handlePercent();
        }
    });
    
    // Initialize
    updateDisplay();
}); 