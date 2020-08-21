---
layout: post
title: String comparison using '=='
subtitle: 'How the usage differs in Java and C#'
tags: 'C#,Java,Fundamentals'

---

In this article let's deep dive into how the equality operator ("==") behaves while comparing Strings in Java. We will also briefly see how it differs in C#.

### Let's begin with Java
In Java we have two inbuilt mechanisms to check for equality:

 - **==** operator  
 
	* To compare the values of primitive data types (int, float, double,..). 
	 * To check if two object references point to the same object.  
	 
 -  **equals()** method
	 - `equals()` method belongs to the `Object` class. You have to override it as per your requirement, but for **String** it is already overridden and it checks whether two strings have the same value or not.
	 * If you don't override the `equals()` method in your class, then the `equals()` method of the closest parent class that has overridden this method will be used.
	 * But if no parent class has overridden the `equals()` method then the `equals()` method of the ultimate superclass - the `Object` class is used. And as per the [Java API Specification](https://docs.oracle.com/javase/10/docs/api/java/lang/Object.html#equals%28java.lang.Object%29) : 
		 > For any non-null reference values x and y, equals() method returns true if and only if x and y refer to the same object.  

		i.e. in this case `equals()` will behave same like `==` 

Let us now see how == and equals() behave while comparing strings. But before that here are some basics that every developer should know about strings:  

A **literal** is a value you _literally_ type in your code and so they are fixed. Example:
~~~java
int age = 3; //integer literal
boolean isAvailable = true; //boolean literal
String str1 = "Hello World"; //string literal
~~~

A _string literal_ consists of zero or more characters enclosed in double quotes. A string literal is a reference to an instance of class String.
You can also create a string by explicitly creating an instance of class String.  
~~~java
String str2 = new String("Hello World");   
~~~
We can see that both **str1** (string literal) and **str2** (new String()) are **instances of class String**. However there is one important difference between the two.
 





**==** 

**.equals()** checks for the actual string content (value).

  

Note that the **.equals()** 

~~~java
String s1 = "Hello World";    
String s2 = "Hello World";    
s1 == s1; // true    
s1.equals(s2); // true
~~~

Reason: String literals created without null are stored in the string pool in the permgen area of the heap. So both s1 and s2 point to the same object in the pool.

String constants are usually "interned" such that two constants with the same value can actually be compared with ==, but it's better not to rely on that.

  
~~~java
String s1 = new String("Hello World");    
String s2 = new String("Hello World");    
s1 == s2; // false    
s1.equals(s2); // true
~~~
  

//Reason: If you create a String object using the `new` keyword a separate space is allocated to it on the heap.

  

## In C#

For predefined value types, == returns true if the values of its operands are equal.

For reference types **other than string**, **==** returns true if its two operands refer to the same object. For the string type, == compares the values of the strings.

~~~csharp
var x = new StringBuilder("Hello World");    
var y = new StringBuilder("Hello World");    
Console.WriteLine(x == y); //False
~~~
  Reason for the above output: Both x and y point to different objects

~~~csharp
var x = new StringBuilder("Hello World").ToString();    
var y = new StringBuilder("Hello World").ToString();
Console.WriteLine(x == y); //True
~~~

  Reason for the above output: x and y are now strings and hence == will compare their values




