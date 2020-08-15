## In Java

**==** checks if the two references point to the same object or not.

**.equals()** checks for the actual string content (value).

  

Note that the **.equals()** method belongs to class Object. You need to override it as per you class requirement, but for String it is already implemented and it checks whether two strings have the same value or not.

    String s1 = "Hello World";    
    String s2 = "Hello World";    
    s1 == s1; // true    
    s1.equals(s2); // true


//Reason: String literals created without null are stored in the string pool in the permgen area of the heap. So both s1 and s2 point to the same object in the pool.

// String constants are usually "interned" such that two constants with the same value can actually be compared with ==, but it's better not to rely on that.

  

    String s1 = new String("Hello World");    
    String s2 = new String("Hello World");    
    s1 == s2; // false    
    s1.equals(s2); // true

  

//Reason: If you create a String object using the `new` keyword a separate space is allocated to it on the heap.

  

## In C#

For predefined value types, == returns true if the values of its operands are equal.

For reference types **other than string**, == returns true if its two operands refer to the same object. For the string type, == compares the values of the strings.

  

    var x = new StringBuilder("Hello World");    
    var y = new StringBuilder("Hello World");    
    Console.WriteLine(x == y); //False

  Reason for the above output: Both x and y point to different objects

    var x = new StringBuilder("Hello World").ToString();    
    var y = new StringBuilder("Hello World").ToString();
    Console.WriteLine(x == y); //True

  Reason for the above output: x and y are now strings and hence == will compare their values


