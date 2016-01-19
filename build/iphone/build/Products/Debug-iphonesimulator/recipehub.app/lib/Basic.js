// array
var fruits = ['apple', 'oranges', 'bananas', 'kiwi', 'lemon', 'pineapple'];
var _fruits = fruits;


// to interate through the objects in an array
for (var i = 0; i < fruits.length; i++) {
    var fruit = fruits[i];
    console.log(fruit);    
} 

// remove an item from the end of an array
var lastItem = fruits.pop();

// remove an item from the start of an array
var firstItem = fruits.shift();

// remove an item from an index, number of items you want to remove
var removedItems = fruits.splice(3, 2);



// add item to an array
fruits.push('blueberry');

// add item to the start of an array
fruits.unshift('strawberry');

