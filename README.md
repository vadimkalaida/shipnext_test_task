Questions
// Write down your answers in the README.md file at the root of your project folder.

1. How to change the code to support different file format versions?

<strong>Answer</strong>: It's quite simple. 

I have created a `src/file/services/read-file.service.ts`. This service is responsible for reading the file and returning the data in the format of the string that the application expects to start parsing it.

All you gotta do is to add the new method with the name of the file format to the `src/file/services/read-file.service.ts` class.

In `src/file/configs/multer.config` everything will be changed by itself since the array of the accepted file extensions is the array of names of the methods that `src/file/services/read-file.service.ts` contains.

2. How will the import system change if in the future we need to get this data from a web API?

<strong>Answer</strong>: Maybe I didn't understand the question in a proper way, but this is how I would do.

So, parser logic is in `src/global-services/parse.service.ts`. It's a global service, so I can use it everywhere I want. It accepts the string. Therefore, I would just have to get the data from the API (convert it into string if it's needed) and pass it to the `parse.service.ts`. There wouldn't be any changes. Just a bit of new logic to get the data from some API.

3. If in the future it will be necessary to do the calculations using the national bank rate, how could this be added to the system?
4. How would it be possible to speed up the execution of requests if the task allowed you to update market data once a day or even less frequently? Please explain all possible solutions you could think of.
