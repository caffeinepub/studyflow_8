import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type StudySession = {
    date : Text;
    studySeconds : Nat;
    breakSeconds : Nat;
    stopCount : Nat;
  };

  type TodoItem = {
    id : Nat;
    text : Text;
    completed : Bool;
    createdAt : Int;
  };

  module TodoItem {
    public func compareByCreatedAt(item1 : TodoItem, item2 : TodoItem) : Order.Order {
      Nat.compare(item1.id, item2.id);
    };
  };

  var nextTodoId = 0;
  let todos = Map.empty<Nat, TodoItem>();
  let dailySessions = Map.empty<Text, StudySession>();

  // Daily Session Functions
  public shared ({ caller }) func saveDailySession(date : Text, studySeconds : Nat, breakSeconds : Nat, stopCount : Nat) : async () {
    let session : StudySession = {
      date;
      studySeconds;
      breakSeconds;
      stopCount;
    };
    dailySessions.add(date, session);
  };

  public query ({ caller }) func getDailySessions() : async [StudySession] {
    dailySessions.values().toArray();
  };

  // Todo Functions
  public shared ({ caller }) func addTodo(text : Text) : async {
    id : Nat;
    text : Text;
    completed : Bool;
    createdAt : Int;
  } {
    let todo : TodoItem = {
      id = nextTodoId;
      text;
      completed = false;
      createdAt = 0;
    };
    todos.add(nextTodoId, todo);
    nextTodoId += 1;
    todo;
  };

  public shared ({ caller }) func toggleTodo(id : Nat) : async TodoItem {
    switch (todos.get(id)) {
      case (null) { Runtime.trap("Todo not found") };
      case (?todo) {
        let updatedTodo : TodoItem = {
          id = todo.id;
          text = todo.text;
          completed = not todo.completed;
          createdAt = todo.createdAt;
        };
        todos.add(id, updatedTodo);
        updatedTodo;
      };
    };
  };

  public shared ({ caller }) func deleteTodo(id : Nat) : async Bool {
    if (todos.containsKey(id)) {
      todos.remove(id);
      true;
    } else { false };
  };

  public query ({ caller }) func getTodos() : async [TodoItem] {
    todos.values().toArray().sort(TodoItem.compareByCreatedAt);
  };
};
