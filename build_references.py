import os

files = []
		 		 
def add(folder):
	files.extend(''.join('/// <reference path="' + root.replace('src\\', '') + '\\' + file + '" />')
			for root, dirs, files in os.walk(folder)
			for file in files
			if file.endswith('.ts')
			if not '_' in file
		)
			 
add('src\\lib')
add('src\\core')
text_file = open("src\\ref.ts", "w")
text_file.write("\n".join(files))
text_file.close()