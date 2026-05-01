Challenges:

NOTE: That this is taken list during the development process improved for grammar.

```
- Setting up and using Appwrite as a server database is quite challenging, but I managed to roll out everything from setup to deployment. At first, I got confused because there’s still existing documentation from their API using Datatable, but eventually I adjusted.

- Pagination in Appwrite is still kind of fresh especially for deep pagination, it still needs proper platform logic to get the correct sequences.

- Debugging on the server side is also quite a challenge. You have to trace file routes and return logs. I haven’t really dived deep into the Remix documentation yet, but I’m more comfortable debugging when it’s already on the client or browser side.

- Recently, I’ve been more into using NoSQL, and when writing in Appwrite, it definitely feels like noSQL somehow but its SQL.

- I still need to plan the correct implementation based on requirements—especially how two datasets should relate to each other. At first, I implemented the Applicant table, but when I started working on another dataset (Interview), it became a bit complicated, especially when adding relational APIs but I still handled it.

- I haven’t created a lookup for each data enumeration yet. For now, it just displays IDs or I hide some of them, since it would take more time to implement the necessary API logic.

- Linting/Prittier isn’t working properly during development. I servive without it but manage to prettier it in the end. LOL

- I initially planned to use a ready-made template, but it turned out to be outdated one version behind, with deprecated usage and TypeScript issues. Bad investment lol.

- Pages still need refinement. This is just a paper-based design layout—simple, robust, and clean.

- Proper error handling without breaking the page still needs improvement.

- There’s always room for improvement.

- Routing can still be improved, I was experimenting between basic routes and intercepting routes. XD
```

