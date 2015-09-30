# Music-Matrix-Composer
This is the Music Matrix Composer for everyone to play with.

The SQL file is a bit weird. You would need to change mugdev_com in the top line with your own data base name that you want to use and the user that you want to use to work with (assuming XAMPP)

You also have to change the stuff in configs/sqlConnect.php to use your own login username and password as well to make it work.

----

## Design Philosophy
Please consider the following when making changes. 

The idea of the program is to allow new composers and first time musicians such as one man game devs to create music. The idea of the project is to be simple. The problem I first encountered when I began this project is that there isn't any programs out there with a simple enough interface that allows you to create music. You would end up with a track area and anywhere between 5 to 15 extra windows in your viewing space to allow you to controll every aspect of your song when in reality a new user isn't going to make use of all 5-15 of those extra windows full of features. All a basic user wants to do is to create a simple arrangement and enjoy self made music. That's what this program aims to do, allow new musicians to create simple melodies and beats that they are able to enjoy and share. They can of course add in additional effecst such as Reverb and so on in another program if they so wish. With that said, there is currently a total of 10 buttons wtih different functions that a user can do. If you are thinking of adding more to the functions list, please ask youself: If I was new at music composition, would I absolutely need this?

## Programming related stuff
Here's a bunch of information related to the programming of the Music Matrix Composer V2

The data of the program is stored in an array of objects. the array is called "song" so if you type that into the console of your webpage, you will be able to see the data representation of the song that you are making. Not particularly useful for compositing but quite useful if you want to see if the changes you made worked. 

The audio is generated via a scale which is saved as a part of each tracks's "scale" parameter. Each virtcal line of notes is stored in the long array of each track. The notes are stored as "T|x|" where |x| is a number between 1 and 16 and each T|x| referencing to a note in the scale. the number is the note the midi note that corrisponds to the number in accordance with General Midi Standard : https://en.wikipedia.org/wiki/General_MIDI and is played through the Midi.JS plugin

The presets array is where I keep all the presets that any user can use. They are in a somewhat arbiturary order. The only exception is that the Music Matrix cords should always be kept at the top. 

Functions are not really orginized well but I try to group them in accordance to relevance to each other and if they share the same variable or not or if they call upon each other or not. Generally ctrl + f is your best option for trying to find something that you need. Alot of these functions are called from DOM objects and will often pass themselves into the function. One of the few standards that I use is that whenever a DOM element passes itself into the function the variable name for that dom element is always "ele" otherwise variable names are all over the place. I try to keep them meaningful but I dont always succeed (see combo/quote related functions). 

Variable that the functions uses that needs to be kept global and accessable by other functions are oftne kept above the function that would first make use of it instead of at the top of the JS file. Many times other functions will make use of these variables will be located elsewhere but the variable will most likely stick with a function that toggles it. I dont always succeed on this either so the program is kind of messy to read at times. 

I try to make plenty of comments in the functions and give functions descriptive names to make sure at the very least I know what they're doing. However I'm not very good at commenting my code so if you have any questions please feel free to message me on reddit about exactly what a function does or a spicific line of code. Generally if a line of code looks confusing, it's because there's a better way to implement it and I'm just too stupid/lazy to find said better way. https://www.reddit.com/user/muggy8/

Currently the program slows down alot after the 4th track that you add (at least on my computer). This is probably a result of my stupid code being very verbose and not very elegant. Another reason could be the limitation in javascript and how fast it can execute. If you are planning on doing a complete backend overhull then please let me know, I'm pretty open to new innovations but complete backend overhulls are not in the list of things that I would like to do myself as I have alerady done it once. 

Lastly, if you make use of another library in your modifications such as BootStrap or the likes, Please mention it to me in some way or another so I can add them to the credits.

## Legal Stuff?

Not much to see here. If you fork this project or derive something from this project, do make sure to mention me (Muggy Ate or Muggy8) in your credits somewhere. Otherwise, you are free to fork and hack this program as much as you like. 

Special thanks to the following people for making this program possiable: 

Mudcube: Midi.JS

Gleitz: Midi.JS SoundFonts

Letoribo: General Midi Percussion SoundFonts

Eligrey: FileSaver.js

Eligrey: Blobs.js

Valentin Schmidt: PHP Midi

Sterling Isfine: Interval Manager

Peter mortensen and Crazyx: JSON object deep comparison 

JQuery Community: All of JQuery

Tonematrix Audiotool: Inspiration

