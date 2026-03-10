import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Specify the data migration function in with-clause
(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  type Subject = {
    id : Text;
    name : Text;
    createdAt : Int;
  };

  type Topic = {
    id : Text;
    subjectId : Text;
    text : Text;
    completed : Bool;
    createdAt : Int;
  };

  module Topic {
    public func compareByCreatedAt(topic1 : Topic, topic2 : Topic) : Order.Order {
      Nat.compare(
        (if (topic1.createdAt < 0) { -topic1.createdAt } else { topic1.createdAt }).toNat(),
        (if (topic2.createdAt < 0) { -topic2.createdAt } else { topic2.createdAt }).toNat(),
      );
    };
  };

  module Subject {
    public func compareByCreatedAt(subject1 : Subject, subject2 : Subject) : Order.Order {
      Nat.compare(
        (if (subject1.createdAt < 0) { -subject1.createdAt } else { subject1.createdAt }).toNat(),
        (if (subject2.createdAt < 0) { -subject2.createdAt } else { subject2.createdAt }).toNat(),
      );
    };
  };

  module TodoItem {
    public func compareByCreatedAt(item1 : TodoItem, item2 : TodoItem) : Order.Order {
      Nat.compare(
        (if (item1.createdAt < 0) { -item1.createdAt } else { item1.createdAt }).toNat(),
        (if (item2.createdAt < 0) { -item2.createdAt } else { item2.createdAt }).toNat(),
      );
    };
  };

  type UserData = {
    todos : Map.Map<Nat, TodoItem>;
    dailySessions : Map.Map<Text, StudySession>;
    nextTodoId : Nat;
    subjects : Map.Map<Text, Subject>;
    topics : Map.Map<Text, Topic>;
    nextSubjectId : Nat;
    nextTopicId : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let userData = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func getUserState(caller : Principal) : UserData {
    switch (userData.get(caller)) {
      case (null) {
        let newUserState = {
          todos = Map.empty<Nat, TodoItem>();
          dailySessions = Map.empty<Text, StudySession>();
          nextTodoId = 0;
          subjects = Map.empty<Text, Subject>();
          topics = Map.empty<Text, Topic>();
          nextSubjectId = 0;
          nextTopicId = 0;
        };
        userData.add(caller, newUserState);
        newUserState;
      };
      case (?state) { state };
    };
  };

  func updateUserState(caller : Principal, state : UserData) {
    userData.add(caller, state);
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Daily Session Functions
  public shared ({ caller }) func saveDailySession(date : Text, studySeconds : Nat, breakSeconds : Nat, stopCount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save study sessions");
    };
    let userState = getUserState(caller);
    let session : StudySession = {
      date;
      studySeconds;
      breakSeconds;
      stopCount;
    };
    userState.dailySessions.add(date, session);
  };

  public query ({ caller }) func getDailySessions() : async [StudySession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access study sessions");
    };
    let userState = getUserState(caller);
    userState.dailySessions.values().toArray();
  };

  // Todo Functions
  public shared ({ caller }) func addTodo(text : Text) : async {
    id : Nat;
    text : Text;
    completed : Bool;
    createdAt : Int;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add todos");
    };
    let userState = getUserState(caller);
    let todo : TodoItem = {
      id = userState.nextTodoId;
      text;
      completed = false;
      createdAt = 0;
    };
    userState.todos.add(userState.nextTodoId, todo);
    updateUserState(
      caller,
      {
        userState with
        nextTodoId = userState.nextTodoId + 1;
      },
    );
    todo;
  };

  public shared ({ caller }) func toggleTodo(id : Nat) : async TodoItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle todos");
    };
    let userState = getUserState(caller);
    switch (userState.todos.get(id)) {
      case (null) { Runtime.trap("Todo not found") };
      case (?todo) {
        let updatedTodo : TodoItem = {
          id = todo.id;
          text = todo.text;
          completed = not todo.completed;
          createdAt = todo.createdAt;
        };
        userState.todos.add(id, updatedTodo);
        updatedTodo;
      };
    };
  };

  public shared ({ caller }) func deleteTodo(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete todos");
    };
    let userState = getUserState(caller);
    if (userState.todos.containsKey(id)) {
      userState.todos.remove(id);
      true;
    } else { false };
  };

  public query ({ caller }) func getTodos() : async [TodoItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access todos");
    };
    let userState = getUserState(caller);
    userState.todos.values().toArray().sort(TodoItem.compareByCreatedAt);
  };

  // Subject Planner Functions
  public shared ({ caller }) func addSubject(name : Text) : async Subject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add subjects");
    };
    let userState = getUserState(caller);
    let subjectId = userState.nextSubjectId.toText();
    let subject : Subject = {
      id = subjectId;
      name;
      createdAt = 0; // TODO: timestamp input for timestamps
    };
    userState.subjects.add(subjectId, subject);
    updateUserState(
      caller,
      {
        userState with
        nextSubjectId = userState.nextSubjectId + 1;
      },
    );
    subject;
  };

  public shared ({ caller }) func deleteSubject(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete subjects");
    };
    let userState = getUserState(caller);
    if (userState.subjects.containsKey(id)) {
      userState.subjects.remove(id);
      // Delete all topics for this subject
      let topicsToRemove = userState.topics.filter(
        func(_topicId, topic) { topic.subjectId == id }
      );
      for (entry in topicsToRemove.entries()) {
        userState.topics.remove(entry.0);
      };
      true;
    } else { false };
  };

  public shared ({ caller }) func addTopics(subjectId : Text, texts : [Text]) : async [Topic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add topics");
    };
    let userState = getUserState(caller);
    let newTopics = texts.map(
      func(text) {
        let topicId = userState.nextTopicId.toText();
        let topic : Topic = {
          id = topicId;
          subjectId;
          text;
          completed = false;
          createdAt = 0; // TODO: timestamp input for timestamps
        };
        userState.topics.add(topicId, topic);
        topic;
      }
    );
    updateUserState(
      caller,
      { userState with nextTopicId = userState.nextTopicId + texts.size() },
    );
    newTopics;
  };

  public shared ({ caller }) func toggleTopic(id : Text) : async Topic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle topics");
    };
    let userState = getUserState(caller);
    switch (userState.topics.get(id)) {
      case (null) { Runtime.trap("Topic not found") };
      case (?topic) {
        let updatedTopic : Topic = {
          topic with
          completed = not topic.completed
        };
        userState.topics.add(id, updatedTopic);
        updatedTopic;
      };
    };
  };

  public shared ({ caller }) func deleteTopic(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete topics");
    };
    let userState = getUserState(caller);
    if (userState.topics.containsKey(id)) {
      userState.topics.remove(id);
      true;
    } else { false };
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access subjects");
    };
    let userState = getUserState(caller);
    userState.subjects.values().toArray().sort(Subject.compareByCreatedAt);
  };

  public query ({ caller }) func getTopics() : async [Topic] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access topics");
    };
    let userState = getUserState(caller);
    userState.topics.values().toArray().sort(Topic.compareByCreatedAt);
  };

  // NEW: ensureUser function
  // Note: This function allows self-registration by calling assignRole.
  // Since assignRole has admin-only guards internally, this will only work
  // if the access control system allows self-registration for guests.
  // If assignRole strictly requires admin privileges, an admin must register users instead.
  public shared ({ caller }) func ensureUser() : async () {
    // Block anonymous principals
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot be registered");
    };

    // Check current role
    let currentRole = AccessControl.getUserRole(accessControlState, caller);

    // Only register if currently a guest
    switch (currentRole) {
      case (#guest) {
        // Attempt to assign user role
        // Note: If AccessControl.assignRole has admin-only guards,
        // this call will trap. In that case, user registration must
        // be done by an admin through the assignRole function from MixinAuthorization.
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
      case (_) {
        // User already has a role (user or admin), do nothing
      };
    };
  };
};

