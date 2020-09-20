---
layout: post
title: REST API Versioning - Why and How? 
tags: [REST API, Web Development, Fundamentals]

---


Today, any business which is using a modern web or mobile application to serve its clients is most likely using Web APIs. As the business grows, its software applications also evolve to meet business goals. And sometimes you also need to modify the application's Web APIs. Let's take an example to understand this.  

I am a reputed book wholesaler - '*Sia Bookstore'*. I am a large supplier of books to my clients - small bookstores and schools. My clients search for books and place their orders through my bookstore's web site or mobile app which internally use REST APIs. There is an API endpoint which returns a list of books.

    GET https://siabookstore.com/api/books

It returns a JSON array of books. A book object is something like this:
~~~json
{
  "ISBN": 9780143333623,
  "title": "Grandma's Bag of Stories",
  "author": "Sudha Murty"
}
~~~
I need to add a new feature where my clients can see more books by the same author when they click on the author's name. To do this I need to add more detail to the author in response. Like this-
~~~json
{
  "ISBN": 9780143333623,
  "title": "Grandma's Bag of Stories",
  "author": {
    "id": 75704,
    "name": "Sudha Murty"
  }
}
~~~
Modifying this Web API's response is not a challenging task but we must analyze the outcomes of such modifications on our client applications beforehand. In our example, the value of _author_ has changed from _string_ to an _object_. This is a breaking change and we need to modify our client applications to handle this.

For some reasons, _Sia Bookstore_ decided to make this feature available only on its web application. Mobile apps would get this functionality sometime later. So till then, we will have to maintain two separate versions of Web APIs: 

 - Version 1. For mobile apps 
 - Version 2. For web application

![enter image description here](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/api-ver-01.png)

## How do we version Web APIs?

  
To do this, we need to mention the version of Web API we want to consume while sending the HTTP Request. There are four different places in an HTTP Request where we can specify the version:

1.  In the URI
2.  In a Query String
3.  In the Accept Header
4.  In a custom HTTP Header

Each one of these has its pros and cons. Let's discuss these in details.

**1. Specifying version in the URI**  
Every time you modify your Web API or modify the schema of response, you add a version number to the URI. The previously existing URIs should continue to operate as before. For our bookstore example, we can do it like this-
~~~
GET https://siabookstore.com/api/v2/books
~~~

For now, the older URI-
~~~
https://siabookstore.com/api/books
~~~
can be assumed to be *Version 1* if you don't want to modify the client application (mobile app).  

Tip: If you are working to write Web APIs for an application from scratch and you believe these APIs would evolve in future, I would suggest you mention /v1 in the URI from beginning. This has a benefit that other developers can probably guess what this /v1 means just by looking at the URI.

**Pros**: Easy to implement and understand. Web Servers will handle the routing for you if you have set up your directory structure appropriately.  
**Cons**: Some people who strictly adhere to the rules - "Once a URI is assigned to a resource it should never change" or "A resource must be accessible by only one URI" argue that this method of versioning is bad. For e.g.  in our case, one book is being represented by multiple URIs.
~~~
../api/v1/books/9780143333623
../api/v2/books/9780143333623
~~~
*#FYI*: YouTube and Twitter use this form of versioning in their APIs



**2. Specifying version in a Query String**  
Another way to specify the version in the HTTP request is to mention it in a query string of the URI. Something like this:
~~~
GET https://siabookstore.com/api/books?ver=2
~~~
This technique allows you to host several API versions on a single base path and differentiate between them using the query string parameter.  
  
**Pros:** One resource will be identified by only one URI. e.g.
~~~
../api/books/9780143333623&ver=1
../api/books/9780143333623&ver=2
~~~
If you are thinking- the above two URIs represent two different resources, please note that in REST APIs, path parameters are used to identify resources while query parameters are used to sort/filter those resources. Here path of the resource is `../api/books/9780143333623` whereas `ver=1` is a filter.

**Cons:** You will have to handle the HTTP request to parse the query string and send the response accordingly.


**3. Specifying version in the Accept Header**

Also known as **Media type versioning**. 

In an HTTP request, [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) header allows the client application to specify what the response body should be - JSON, Text, XML or any other format which the client can parse. Along with this, it is also possible to define custom [media types](https://en.wikipedia.org/wiki/Media_type) which enables the client application to specify which version of a resource it is expecting. 
Let's see how we can use the Accept header to specify the version for our bookstore API. There are two ways of doing this:

(i) Specify version as **part of the media type**:

~~~
GET https://siabookstore.com/api/books/9780143333623
Accept: application/vnd.siabookstore.v2+json
~~~
`application/vnd.siabookstore.v2` is the Media Type.  
`json` is the suffix.

(ii) Specify version as a **parameter to the media type**:
~~~
GET https://siabookstore.com/api/books/9780143333623
Accept: application/vnd.siabookstore+json;version=2
~~~  
`application/vnd.siabookstore` is the Media Type.  
`json` is the suffix.  
`version=2`  is the parameter.

If you are unfamiliar with the nomenclatures mentioned above, let me try to explain these through the diagram below. Here are two different values of *Accept* header used in our example:  

![enter image description here](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/api-ver-02.png)
  
In both the header values shown above, media type's sub type is vendor specific (hence the prefix - 'vnd'). As this API is for the company Sia Bookstore, we have added the suffix - 'siabookstore'. It doesn't matter what suffix you keep, but it should be prefixed with 'vnd'. If you are creating a public API then it is recommended to get your custom content type [registered with IANA](https://www.iana.org/assignments/media-types/media-types.xhtml). However it is not mandatory.   
  
 ***Suffix*** is optionally used to specify the underlying structure of the media type. In our example its JSON. A '+' sign is used to separate the media type and suffix. The media type **may be** followed by ***parameters*** in the form of '*name=value*' pairs. In our example it is `version=2`. The presence of parameter(s) after a media type can affect the processing of the request.

Your server application should process the Accept header and see if it can respond to the client in the format it asked for. The web server confirms the format of the response data in the Content-Type header. But if the Accept header does not specify any known media type, the web server can send HTTP [406 (Not Acceptable)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406) response message or return a message with a default media type.

**Pros**: It conforms to the one resource, one URI guideline of REST.  
**Cons**: Clients should be aware of implementing the custom media type. Relatively harder to implement and test than the earlier two techniques. 

#FYI: GitHub uses this versioning mechanism. You can read about it [here](https://developer.github.com/v3/media/).

**4. Specifying version in a custom HTTP Header** 
We can add a custom header to our HTTP request to specify the version of the API. Client applications will have to add this custom header to all the required HTTP requests.

~~~
GET https://siabookstore.com/api/books/9780143333623
siabookstore-api-ver: 2
~~~

**Pros** & **Cons**: Nearly similar to previous technique (Media type versioning).

------------------
These were the four major versioning techniques that API developers generally use. Remember, there are no strict rules for versioning. You need to determine which technique best fulfils your requirement. But one thing I would like to mention is the effect of the versioning technique on the performance of your application. To improve the performance of web APIs, developers implement server-side caching. Instead of querying the database to get the data every time, data is fetched from the cache if it is available there. The URI versioning and Query String versioning techniques are cache-friendly. The Header versioning techniques require further logic to check the values in the Accept header or the custom header.

**Should you support all versions of your APIs forever?**  
Supporting all the versions forever may prove to be costly and would become cumbersome for you. If you choose to deprecate an old version of your API, you should notify your clients well in advance so that they upgrade their applications. Any deprecated API that is not supported anymore should return HTTP [410 (Gone)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410) error response code.

