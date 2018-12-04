var budgetController = (function () {

    var Expense = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.persentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        totalIncome > 0 ? this.persentage = Math.round((this.value / totalIncome) * 100) : this.persentage = -1;

    };

    Expense.prototype.getPercentage = function () {

        return this.persentage;
    };

    var Income = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {

        var sum = 0;
        data.allItems[type].forEach(function (cur) {
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
        persentage: -1
    };

    return {

        addItem: function (type, des, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },


        calculateBudget: function () {

            // Calculation total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the persentage of income that we spend
            data.totals.inc > 0 ? data.persentage = Math.round((data.totals.exp / data.totals.inc) * 100) : data.persentage = -1;

        },

        calculatePercentage: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });


        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                persentage: data.persentage
            };

        },

        testing: function () {

            console.log(data);
        }
    };

})();

var UIController = (function () {

    var DOMstrings = {

        inputType: '.add__type',
        inputDescriptin: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        persentageLable: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLable: '.item__percentage',
        dateLable: '.budget__title--month'

    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;


        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {

        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescriptin).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {

                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {

                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (selectorID) {
            var el;

            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var field, fieldsArr;

            field = document.querySelectorAll(DOMstrings.inputDescriptin + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(field);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLable).textContent =  formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');

            obj.persentage > 0 ? document.querySelector(DOMstrings.persentageLable).textContent = obj.persentage + '%' :
                document.querySelector(DOMstrings.persentageLable).textContent = '---';


        },

        displayPercentages: function (persentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLable);


            nodeListForEach(fields, function (current, index) {

                persentages[index] > 0 ? current.textContent = persentages[index] + '%' : current.textContent = '---';

            });

        },

        displayMonth: function () {
          
            var now, year, month, months;

            now = new Date();

            months = ['January','February','March','April','May','June','July','August','September','October','	November','December'];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLable).textContent = months[month] + ' ' +  year;


        },

        changedType: function(){
            var fields;

            fields = document.querySelectorAll(
                DOMstrings.inputType  + ',' +
                DOMstrings.inputDescriptin + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){

                cur.classList.toggle('red-focus')

            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function () {
            return DOMstrings; /// Public DOMstrings
        }

    }

})();

// Global App Controller

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {

                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function () {
        var budget;

        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        budget = budgetCtrl.getBudget();

        //Show the result
        UICtrl.displayBudget(budget);


    };

    var updatePercentages = function () {

        // Calculate percentage
        budgetCtrl.calculatePercentage()

        // Read percentage from budget controller
        var percentages = budgetCtrl.getPercentages();


        // Update the UI with the new percentage
        UICtrl.displayPercentages(percentages);



    };

    var ctrlAddItem = function () {

        var input, newItem;

        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear the fields 
            UICtrl.clearFields();

            //Calculate and update Budget
            updateBudget();

            //Calculate and update percentage
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete  the item from UI
            UICtrl.deleteListItem(itemID);

            // Update and show the new budget
            updateBudget();

        }

    };

    return {
        init: function () {

            console.log('Application start working!');

            UICtrl.displayMonth();

            //Reset UI
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                persentage: -1
            });

            setupEventListeners();

        }
    }


})(budgetController, UIController);


controller.init();