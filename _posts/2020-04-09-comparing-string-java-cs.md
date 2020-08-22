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
	 * But if no parent class has overridden the `equals()` method then the `equals()` method of the ultimate superclass - the `Object` class is used. And as per the [Java API Specification](https://docs.oracle.com/javase/10/docs/api/java/lang/Object.html#equals%28java.lang.Object%29) : For any non-null reference values x and y, equals() method returns true if and only if x and y refer to the same object.  Therefore in this case `equals()` will behave same like `==` 

We will see how **==** and **equals()** behave while comparing Strings. But before we get there, here are some basics we should know:  

A **literal** is a value you _literally_ type in your code and so they are fixed. Example:
~~~java
int age = 3; //integer literal
boolean isAvailable = true; //boolean literal
String str1 = "Hello World"; //string literal
~~~

A **_string literal_** consists of zero or more characters enclosed in double quotes. A string literal is a reference to an instance of class String.   
You can also create a string by explicitly creating an instance of class String.  
~~~java
String str2 = new String("Hello World");   
~~~
We can see that both **str1** (string literal) and **str2** (new String()) are **instances of class String**. However there is an important difference between the two. To understand this difference we should first understand **Interning of String**.  

To preserve memory and improve performance Java (JVM to be specific) maintains a ***pool of strings***  internally on the heap. When you create a string literal e.g. `String x = "Hello World"` JVM will look for this string value in its pool of strings, and -
 - If found, it will return the reference of the already existing string.  
 - If not found, this string object is added to the pool and a reference to this newly added string is returned.

 
So even if you create multiple string literals with the same value, JVM will ensure there exists only 1 copy of that string in the memory. e.g.  
~~~java
String x = "Hello World";
String y = "Hello World";
String z = "Hello World";
~~~  
For the above code snippet, JVM will maintain only one 1 copy of "Hello World" in its pool of strings. Variables x, y and z will hold references to the same string object in the pool. This process is called *Interning of String* and *when ever you create a string literal it is automatically interned by the JVM*.  

Now lets look at the code snippet below and try to understand its output.
~~~java
String s1 = "Hello World";  
String s2 = "Hello World";  
System.out.println(s1.equals(s2)); // true  
System.out.println(s1 == s2);      // true   
~~~
As we know, in case of strings, **.equals()** compares the values of two strings and hence `s1.equals(s2)` will return **true**. We also know that String is a reference type and for reference types **==** checks if two references point to the same object. Since string literals are automatically interned therefore **s1** and **s2** will have the references to the same string object in the string pool. This explains why `s1 == s2` will also return true.  

This was all about comparing string literals. But what happens when you explicitly create instances of class String using the **new()** operator. In this case, the strings won't be automatically interned. Every string created using the **new()** operator will be allocated a separate space in the heap. This explains the output of the code snippet given below:  
~~~java
String s1 = new String("Hello World");  
String s2 = new String("Hello World");  
System.out.println(s1.equals(s2)); // true  
System.out.println(s1 == s2);      // false. s1 and s2 point to different objects 
~~~
If you want to intern the strings created using **new()** you will have to manually invoke the `intern()` method.  Like this-
~~~java
String s1 = new String("Hello World");  
s1.intern();
~~~
When `intern()` is invoked on string **s1**, JVM checks if the string pool already contains a string equal to "*Hello World*". If yes, then the reference to this string object is returned from the pool. Else, this String object is added to the string pool and a reference to this newly added String object is returned.  

Lets see the code snippet below and try to understand the output:  
~~~java
String s1 = new String("Hello World"); //s1 is created on the heap  
String s2 = s1.intern();  //s1 is added to the string pool and s2 stores its reference  
String s3 = "Hello World";  //s3 will point to the already interned string s2   

System.out.println(s1 == s3);      // false  
System.out.println(s1 == s2);      // false  
System.out.println(s2 == s3);      // true
~~~

In the above code snippet, when we create the string literal **s3** (`String s3 = "Hello World"`) , first the string pool will be searched for "*Hello World*". Since "*Hello World*" was already manually interned in the previous step (`String s2 = s1.intern()`) the reference to the already interned string will be given to **s3**. Eventually both **s2** and **s3** will point to the same string object in the string pool and hence `s2 == s3` will return true.  

I recommend not to use **==** for comparing String values in Java. Instead use **.equals()**.  

<hr />
**Extra**: For those who also code in C# (like me), here is small information on how **==** differs when comparing strings. 

## In C#

For predefined value types, **==** returns true if the values of its operands are equal. (this is same as Java) 

For reference types **other than string**, **==** returns true if its two operands refer to the same object. For the string type, **==** compares the values of the strings. (this behavior is different from Java)  
Here are some code snippets to understand the behavior of == in C#:

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

Reason for the above output: x and y are now strings and hence == will compare their values.  

Like in Java, in C# too **.Equals()** compares the values of two strings.


