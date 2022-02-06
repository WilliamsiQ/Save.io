var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome>0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        
        return this.percentage;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calcTotal = function(type) {
       var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if ( index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        calcBudget: function () {
            calcTotal('inc');
            calcTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentage: function () {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })  

        },
        getperc: function() {
            var allPercs = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPercs
            
        },
        getBudget: function() {
            return {
                incTotal: data.totals.inc,
                expTotal: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    };
    

})();

var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int > 3) {
            num = num.substr(0, num.length - 3) + ',' + num.substr(num.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'inc'? '+': '-') + ' ' + int + '.' + dec;  

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
        
    }

    return {
        getInput: function() {
            return {

                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                button: document.querySelector(DOMstrings.inputButton).value

           }
                    
        },
        clearField: function() {
            var field, fieldArr;
            field = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function(current) {
                current.value = '';
            });
            fieldArr[0].focus();
        },
        displayDate: function() {
            var now, month, months, year;
            now = new Date();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0? type = 'inc': type= 'exp';
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.incTotal, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.expTotal, 'exp');
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
            
        },
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        setType: function () {
            document.querySelector(DOMstrings.inputType).value = 'inc'

        },
        changedType: function() {
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');

        },

        
        getDOMstrings: function(){
            return DOMstrings;
        },
        deleteItemList: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
                
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);    
        }  
    }  


})();
var appController = (function (budgetctrl, UICtrl) {
    
    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

        document.querySelector(DOM.container).addEventListener('click', ctrlDelete);
    };
    var updateBudget = function() {
        budgetctrl.calcBudget();
        var budget = budgetctrl.getBudget();
        UICtrl.displayBudget(budget);

    } 
    var updatePercentages = function () {
        budgetctrl.calculatePercentage();
        var percentages = budgetctrl.getperc();
        UICtrl.displayPercentages(percentages);
        
    } 
    var ctrlAddItem = function() {
        var input, newItem;
        input = UICtrl.getInput();
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            newItem = budgetctrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type)
            UICtrl.clearField();
        }
        updateBudget();
        updatePercentages();
        
        

    };
    var ctrlDelete = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetctrl.deleteItem(type, ID);
            UICtrl.deleteItemList(itemID);
            updateBudget();
            updatePercentages();

        }
        
    };
     return {
         init: function() {
             console.log("app is working");
             UICtrl.displayDate();
             UICtrl.setType();
             UICtrl.displayBudget({
                incTotal:0,  
                expTotal: 0,
                budget: 0,
                percentage: -1});
             setUpEventListeners();
         }
     };  
})(budgetController, UIController);

appController.init();