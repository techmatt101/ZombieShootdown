import os
import sys

srcPath = sys.path[0]
		 		 
def add(folder, list):
	list.extend(''.join('/// <reference path="' + root.replace('src/', '') + '/' + file + '" />')
		for root, dirs, list in os.walk(folder)
		for file in list
		if file.endswith('.ts')
		if not '_' in file
	)

def saveFile(name, data):
	text_file = open("src/" + name + "-ref.ts", "w")
	text_file.write(data)
	text_file.close()

coreFiles = []
add('src/lib', coreFiles)
add('src/core', coreFiles)
coreData = "\n".join(coreFiles);
saveFile('core', coreData)

files = []
add('src/client', files)
saveFile('client', coreData + "\n" + "\n".join(files))

files = []
add('src/server', files)
saveFile('server', "\n".join(files))

print "References Updated"
