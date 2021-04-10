const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username} = request.headers;
  const usernameExists = users.find(item => item.username === username)

  if(!usernameExists) return response.status(400).json({error: "Username doesn't exists!"})
  
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const usernameAlreadyExists = users.find(item => item.username === username)

  if(usernameAlreadyExists) return response.status(400).json({error: "Username already exists!"})


  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  console.log(user)
  return response.status(200).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers
  const userTodos = users.find(user => user.username === username).todos;

  return response.status(200).send([...userTodos])
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username);
  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline, 
    created_at: new Date().toISOString()
  }
  const newTodos = users[userIndex].todos;
  newTodos.push(todo)
  users[userIndex].todos = newTodos

  return response.status(201).send(todo)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers
  const { title, deadline } = request.body

  const userIndex = users.findIndex(user => user.username === username);
  
  const selectedUser = users[userIndex]
  const todoIndex = selectedUser.todos.findIndex(todo => todo.id === id);
  
  if(todoIndex === -1) return response.status(404).json({error: "To do does not exists"})
  
  const selectedTodo = selectedUser.todos[todoIndex];
  const newTodo = {...selectedTodo, title, deadline }
  selectedUser.todos[todoIndex] = newTodo;
 

  return response.status(201).send(newTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username);
  
  
  const selectedUser = users[userIndex]

  const todoIndex = selectedUser.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) return response.status(404).json({error: "To do does not exists"})
  
  const selectedTodo = selectedUser.todos[todoIndex];

  const newTodo = {...selectedTodo, done: true }
  selectedUser.todos[todoIndex] = newTodo;

  return response.status(201).send(newTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { username } = request.headers

  const userIndex = users.findIndex(user => user.username === username);
  
  
  const selectedUser = users[userIndex]

  const todoIndex = selectedUser.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) return response.status(404).json({error: "To do does not exists"})
  
  const newTodos = selectedUser.todos.filter(todo => todo.id !== id)
  users[userIndex] = {...selectedUser, todos: [...newTodos]}
  console.warn(4)
  
  return response.status(204).send()
});

module.exports = app;