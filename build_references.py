import os
import sys

files = []
		 		 
def add(folder):
	files.extend(''.join('/// <reference path="' + root.replace('src/', '') + '/' + file + '" />')
			for root, dirs, files in os.walk(folder)
			for file in files
			if file.endswith('.ts')
			if not '_' in file
		)

srcPath = sys.path[0]
add('src/lib')
add('src/core')

text_file = open("src/ref.ts", "w")
text_file.write("\n".join(files))
text_file.close()

print "References Updated"
