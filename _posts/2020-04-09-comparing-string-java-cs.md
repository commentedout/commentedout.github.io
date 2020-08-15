---
layout: post
title: Comparing strings using ==
subtitle: How the usage differs in Java and C#
tags: [C#, Java, Fundamentals, Java vs C#]

---

<h2 id="in-java">In Java</h2>
<p><strong>==</strong> checks if the two references point to the same object or not.</p>
<p><strong>.equals()</strong> checks for the actual string content (value).</p>
<p>Note that the <strong>.equals()</strong> method belongs to class Object. You need to override it as per you class requirement, but for String it is already implemented and it checks whether two strings have the same value or not.</p>
<pre><code>String s1 = "Hello World";    
String s2 = "Hello World";    
s1 == s1; // true    
s1.equals(s2); // true
</code></pre>
<p>//Reason: String literals created without null are stored in the string pool in the permgen area of the heap. So both s1 and s2 point to the same object in the pool.</p>
<p>// String constants are usually “interned” such that two constants with the same value can actually be compared with ==, but it’s better not to rely on that.</p>
<pre><code>String s1 = new String("Hello World");    
String s2 = new String("Hello World");    
s1 == s2; // false    
s1.equals(s2); // true
</code></pre>
<p>//Reason: If you create a String object using the <code>new</code> keyword a separate space is allocated to it on the heap.</p>
<h2 id="in-c">In C#</h2>
<p>For predefined value types, == returns true if the values of its operands are equal.</p>
<p>For reference types <strong>other than string</strong>, == returns true if its two operands refer to the same object. For the string type, == compares the values of the strings.</p>
<pre><code>var x = new StringBuilder("Hello World");    
var y = new StringBuilder("Hello World");    
Console.WriteLine(x == y); //False
</code></pre>
<p>Reason for the above output: Both x and y point to different objects</p>
<pre><code>var x = new StringBuilder("Hello World").ToString();    
var y = new StringBuilder("Hello World").ToString();
Console.WriteLine(x == y); //True
</code></pre>
<p>Reason for the above output: x and y are now strings and hence == will compare their values</p>

