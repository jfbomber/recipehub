DROP VIEW IF EXISTS vw_recipe_rating_view;
DROP TABLE IF EXISTS recipe_item_ingredient_amount;
DROP TABLE IF EXISTS recipe_rating;
DROP TABLE IF EXISTS recipe_item_instruction;
DROP TABLE IF EXISTS recipe_item_ingredient;
DROP TABLE IF EXISTS recipe_item_ingredient_unit;
DROP TABLE IF EXISTS recipe_item_category;
DROP TABLE IF EXISTS recipe_item;
DROP TABLE IF EXISTS recipe_category;
DROP TABLE IF EXISTS recipe_user;

/* users of the recipe app */
CREATE TABLE recipe_user (
    user_id integer NOT NULL AUTO_INCREMENT,
    email varchar(100) not null,
    password_hash varchar(255) not null,
    password_salt varchar(255) not null,
    primary key (`user_id`),
    CONSTRAINT `uk__recipe_user__email` UNIQUE (`email`)
);


INSERT INTO recipe_user (email, password_hash, password_salt) VALUES ('jason@example.info','7ea27b8b523f8f436c1b2595812c22b1dd32bd9ce1cc7b8120f64e18b991cc00','4ca884fee8be93c3eee0232fc03ef79de3305ba4472a9a678370a3766ca8a5bb');


/* categories the recipe could belong to */
CREATE TABLE recipe_category (
    category_id integer  NOT NULL AUTO_INCREMENT,
    name varchar(100) not null,
    primary key (`category_id`)
);

INSERT INTO recipe_category (name) VALUES ('Breakfast');
INSERT INTO recipe_category (name) VALUES ('Lunch');
INSERT INTO recipe_category (name) VALUES ('Beverages - Alcoholic');
INSERT INTO recipe_category (name) VALUES ('Beverages - Non Alcoholic');
INSERT INTO recipe_category (name) VALUES ('Main dishes: Beef');
INSERT INTO recipe_category (name) VALUES ('Main dishes: Poultry');
INSERT INTO recipe_category (name) VALUES ('Main dishes: Pork');
INSERT INTO recipe_category (name) VALUES ('Main dishes: Seafood');
INSERT INTO recipe_category (name) VALUES ('Main dishes: Vegetarian');
INSERT INTO recipe_category (name) VALUES ('Side dishes: Vegetables');
INSERT INTO recipe_category (name) VALUES ('Side dishes: Other');
INSERT INTO recipe_category (name) VALUES ('Appetizers');
INSERT INTO recipe_category (name) VALUES ('Soups');
INSERT INTO recipe_category (name) VALUES ('Salads');
INSERT INTO recipe_category (name) VALUES ('Desserts');
INSERT INTO recipe_category (name) VALUES ('Other');

/* recipe item */
CREATE TABLE recipe_item (
    recipe_id integer  NOT NULL AUTO_INCREMENT, 
    recipe_created_ts timestamp NULL, -- stores current timestamp if NOT NULL
    recipe_updated_ts timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    title varchar(255) not null,
    description text not null,
    author_id integer null,
    prep_time integer not null,
    cook_time integer null,
    serving_size integer not null,
    active boolean not null default true,
    primary key (`recipe_id`),
    CONSTRAINT `fk__recipe_item__recipe_user__author_id` 
        FOREIGN KEY (`author_id`) REFERENCES `recipe_user` (`user_id`)
); 

/* trigger because in versions previous to 5.6 MySQL only allowed 1 current_timestamp */
DROP TRIGGER IF EXISTS `trigger__recipe_item_created_ts`;
DELIMITER //
CREATE TRIGGER `trigger__recipe_item_created_ts` BEFORE INSERT ON `recipe_item`
 FOR EACH ROW SET NEW.`recipe_created_ts` = NOW()
//
DELIMITER ;



/* category for the recipe, allow for multiple */
CREATE TABLE recipe_item_category (
    recipe_id integer not null,
    category_id integer not null,
    CONSTRAINT `fk__recipe_item_category__recipe_item__recipe_id` 
        FOREIGN KEY (`recipe_id`) REFERENCES `recipe_item` (`recipe_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk__recipe_item_category__recipe_item__category_id` 
        FOREIGN KEY (`category_id`) REFERENCES `recipe_user` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
); 

INSERT INTO `recipe_item_category` (`recipe_id`, `category_id`) VALUES (1,15);
   

/* unit type used in the recipe item ingredient table */
CREATE TABLE recipe_item_ingredient_unit (
    unit_id integer NOT NULL AUTO_INCREMENT,
    primary key (`unit_id`),
    name_abbr varchar(10) not null,
    name_full varchar(50) null
);

-- insert measurements
INSERT INTO recipe_item_ingredient_unit (name_abbr, name_full) VALUES
-- volumn 
('tsp', 'teaspoon'),
('tbl', 'tablespoon'),
('c', 'cup'),
('fl oz', 'fluid ounce'),
('pt', 'pint'),
('qt', 'quart'),
('gal', 'gallon'),
('ml', 'milliliter'),
('l', 'liter'),
('dl', 'deciliter'),
-- mass and weight
('lb', 'pound'),
('oz', 'ounce'),
('mg', 'milligram'),
('g', 'gram'),
('kg', 'kilogram'),
-- length
('mm', 'millimeter'),
('cm', 'centimetre'),
('m', 'meter'),
('in', 'inch');

/* recipe_amounts */
CREATE TABLE recipe_item_ingredient_amount (
    amount varchar(10) not null
);


INSERT INTO recipe_item_ingredient_amount (amount) VALUES
('1/16'),('1/8'),('1/4'),('1/3'),('1/2'),('3/4'),('2/3'),('3/8'); 



/* ingredient for the recipe */
CREATE TABLE recipe_item_ingredient (
    recipe_item_ingredient_id integer NOT NULL AUTO_INCREMENT,
    recipe_id integer not null,
    amount varchar(50) not null,
    unit_id integer null, -- null will be for items like eggs
    ingredient varchar(255) not null,
    PRIMARY KEY (`recipe_item_ingredient_id`),
    CONSTRAINT `fk__recipe_item_ingredient__recipe_item__recipe_id` 
        FOREIGN KEY (`recipe_id`) REFERENCES `recipe_item` (`recipe_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk__recipe_item_ingredient__recipe_item_ingredient_unit__unit_id` 
        FOREIGN KEY (`unit_id`) REFERENCES `recipe_item_ingredient_unit` (`unit_id`) ON DELETE CASCADE ON UPDATE CASCADE
);






/* instruction for the preparation or cooking */
CREATE TABLE recipe_item_instruction (
    recipe_id integer not null,
    instruction_index integer not null,
    instruction text not null,
    CONSTRAINT `fk__recipe_item_instruction__recipe_item__recipe_id` 
        FOREIGN KEY (`recipe_id`) REFERENCES `recipe_item` (`recipe_id`) ON DELETE CASCADE ON UPDATE CASCADE,    
    CONSTRAINT `uk__recipe_item_instruction__recipe_id__instruction_index` UNIQUE (`recipe_id`,`instruction_index`)
); 





/* The ratings other users give the recipe */
CREATE TABLE recipe_rating (
    user_id integer not null,
    recipe_id integer not null,
    rating integer not null,
    CONSTRAINT `fk__recipe_rating__recipe_user__user_id` 
        FOREIGN KEY (`user_id`) REFERENCES `recipe_user` (`user_id`),
    CONSTRAINT `fk__recipe_rating__recipe_item__recipe_id` 
        FOREIGN KEY (`recipe_id`) REFERENCES `recipe_item` (`recipe_id`),        
    CONSTRAINT `uk__recipe_rating__recipe_id__user_id` UNIQUE (`recipe_id`,`user_id`)   
    
);

DROP VIEW IF EXISTS vw_recipe_rating_view;
CREATE VIEW vw_recipe_rating_view
AS
    SELECT count(*) as count, avg(rating) as avg, recipe_id
    FROM recipe_rating 
    GROUP BY recipe_id
;



# Dump of table recipe_item
# ------------------------------------------------------------

LOCK TABLES `recipe_item` WRITE;
/*!40000 ALTER TABLE `recipe_item` DISABLE KEYS */;

INSERT INTO `recipe_item` (`recipe_id`, `recipe_created_ts`, `recipe_updated_ts`, `title`, `description`, `author_id`, `prep_time`, `cook_time`, `serving_size`, `active`)
VALUES
	(1,'2014-12-25 22:23:43','2014-12-25 22:23:43','Chocolate Chip Cookies','Fast and easy To make cookies',1,10,10,48,1),
	(2,'2014-12-26 22:37:22','2014-12-26 22:37:22','Vegetable Salad','Delicious veggie salad',1,5,10,4,1),
	(3,'2014-12-26 22:41:35','2014-12-26 22:41:35','Home made noodles','Easy bake home made noodles.',1,20,5,10,1),
	(4,'2014-12-26 22:51:50','2014-12-26 22:51:50','Healthy Chocolate Pudding','Vegan friendly, creaming chocolate pudding made with avocado and banana.',1,5,5,2,1),
	(5,'2014-12-26 22:54:17','2014-12-26 22:54:17','French Toast','Golden brown french toast.',1,5,10,4,1),
	(6,'2014-12-26 23:01:13','2014-12-26 23:01:13','Vegan Dinner Rolls','Quick vegan dinner rolls',1,15,20,12,1),
	(7,'2014-12-26 23:09:29','2014-12-26 23:09:29','Rasperry Jam','Country style jam, great for toast.',1,60,10,8,1);

/*!40000 ALTER TABLE `recipe_item` ENABLE KEYS */;
UNLOCK TABLES;






# Dump of table recipe_item_category
# ------------------------------------------------------------

LOCK TABLES `recipe_item_category` WRITE;
/*!40000 ALTER TABLE `recipe_item_category` DISABLE KEYS */;

INSERT INTO `recipe_item_category` (`recipe_id`, `category_id`)
VALUES
	(1,15),
	(2,14),
	(3,9),
	(4,15),
	(5,1),
	(6,11),
	(7,1);

/*!40000 ALTER TABLE `recipe_item_category` ENABLE KEYS */;
UNLOCK TABLES;







# Dump of table recipe_item_ingredient
# ------------------------------------------------------------

LOCK TABLES `recipe_item_ingredient` WRITE;
/*!40000 ALTER TABLE `recipe_item_ingredient` DISABLE KEYS */;

INSERT INTO `recipe_item_ingredient` (`recipe_item_ingredient_id`, `recipe_id`, `amount`, `unit_id`, `ingredient`)
VALUES
	(1,1,'1 1/8',4,'Flour'),
	(2,1,'1/4',1,'Baking Soda'),
	(3,1,'1/2',4,'Butter'),
	(4,1,'1/4',4,'Granulated Sugar'),
	(5,1,'1/2',4,'Brown Sugar'),
	(6,1,'1/2',1,'Salt'),
	(7,1,'1',1,'Vanilla Extract'),
	(8,1,'1',0,'Egg'),
	(9,1,'1',4,'Chocolate Chips'),
	(10,2,'1',NULL,'Can Tiny Peas'),
	(11,2,'1',NULL,'Can White Corn'),
	(12,2,'1',NULL,'Can French Cut Green Beans (Chopped)'),
	(13,2,'2',3,'Celery finely chopped'),
	(14,2,'1/2',3,'green pepper finely chopped'),
	(15,2,'3/4',3,'vinegar'),
	(16,2,'1/2',3,'sugar'),
	(17,2,'2/3',3,'oil'),
	(18,3,'1',NULL,'Beaten Egg'),
	(19,3,'2',2,'Milk'),
	(20,3,'2 1/2',1,'Salt'),
	(21,4,'1',NULL,'Ripe Avocado'),
	(22,4,'1',NULL,'Frozen Banana'),
	(23,4,'1 1/3',3,'Maple Syrup'),
	(24,4,'1 1/3',3,'Unsweetened cocoa powder'),
	(25,5,'3',NULL,'Eggs'),
	(26,5,'3 3/4',3,'Milk'),
	(27,6,'2 1/4',1,'Yeast'),
	(28,6,'1 1/4',3,'Warm Water'),
	(29,6,'2 1/4',2,'Sugar'),
	(30,6,'1 1/4',1,'Ground Flaxseed'),
	(31,6,'3 1/4',1,'Water'),
	(32,6,'2 1/4',1,'Vegan Butter'),
	(33,6,'2 1/4',3,'All Purpose Flour'),
	(34,7,'2',3,'Raspberries'),
	(35,7,'2',1,'Chia Seeds'),
	(36,7,'2',1,'Water'),
	(37,7,'2',2,'Chia Seeds'),
	(38,7,'2',2,'Water'),
	(39,7,'2',2,'Honey');

/*!40000 ALTER TABLE `recipe_item_ingredient` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table recipe_item_instruction
# ------------------------------------------------------------

LOCK TABLES `recipe_item_instruction` WRITE;
/*!40000 ALTER TABLE `recipe_item_instruction` DISABLE KEYS */;

INSERT INTO `recipe_item_instruction` (`recipe_id`, `instruction_index`, `instruction`)
VALUES
	(1,0,'Preheat oven to 350 degrees. In a small bowl, whisk together the flour and baking soda; set aside. '),
	(1,1,'In the bowl of an electric mixer fitted with the paddle attachment, combine the butter with both sugars; beat on medium speed until light and fluffy. '),
	(1,2,'Reduce speed to low; add the salt, vanilla, and eggs.'),
	(1,3,'Beat until well mixed, about 1 minute. Add flour mixture; mix until just combined. Stir in the chocolate chips.'),
	(1,4,'Drop heaping tablespoon-size balls of dough about 2 inches apart on baking sheets lined with parchment paper.'),
	(1,5,'Bake until cookies are golden around the edges, but still soft in the center, 8 to 10 minutes. Remove from oven, and let cool on baking sheet 1 to 2 minutes. Transfer to a wire rack, and let cool completely. Store cookies in an airtight container at room temperature up to 1 week.'),
	(2,0,'For the dressing mix the vinegar, sugar and oil and let sit for 4 hours.'),
	(2,1,'Mix the dress with the other ingredients'),
	(3,0,'Mix all of the ingredients, and add enough flour to make stiff dough.'),
	(3,1,'About 1 cup, let stand for 20 minutes.'),
	(3,2,'Cut into little strips.'),
	(4,0,'Combine all ingredients in a food processor. Process until smooth.'),
	(4,1,'Can use unfrozen banana but pudding will need to be chilled in fridge.'),
	(5,0,'Preheat the skillet to 350 degrees.'),
	(5,1,'Mix the milk and eggs. Soak the bread and place on the skillet.'),
	(5,2,'Cook until golden brown on each size,'),
	(6,0,'Combine yeast, warm water and sugar. Let sit 5 to 10 minutes or until frothy.'),
	(6,1,'In small bowl, combine flaxseed with 3 tbls water. Let sit while yeast activates.'),
	(6,2,'Combine yeast, flaxseed and flour in large bowl. Continue kneading until dough is smooth and elastic.'),
	(6,3,'Cover and let rise for 30 minutes.'),
	(6,4,'Separate into twelve balls and Bake at 400 degrees for 18 to 20 minutes or until tops are golden brown.'),
	(7,0,'Combine all ingredients in food processor until desired consistency is achieved.'),
	(7,1,'Chill in refrigerator for at least one hour before serving.');

/*!40000 ALTER TABLE `recipe_item_instruction` ENABLE KEYS */;
UNLOCK TABLES;








/*
Conversions
1 tbl = 3 tsp
1 cup = 16 tbl
1 pint = 2 cup
1 qt = 2 pint
1 gal = 4 qts
1 cup = 8 fl oz
1 fl oz = 2 tbl

mass/volume
1 fl oz = 1 oz
1 pint = 1 lb
2 cups = 1 lb
*/
