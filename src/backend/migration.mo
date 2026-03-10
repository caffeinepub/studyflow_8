import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  // Old types
  type OldStudySession = {
    date : Text;
    studySeconds : Nat;
    breakSeconds : Nat;
    stopCount : Nat;
  };

  type OldTodoItem = {
    id : Nat;
    text : Text;
    completed : Bool;
    createdAt : Int;
  };

  type OldUserData = {
    todos : Map.Map<Nat, OldTodoItem>;
    dailySessions : Map.Map<Text, OldStudySession>;
    nextTodoId : Nat;
  };

  type OldActor = {
    userData : Map.Map<Principal, OldUserData>;
  };

  // New types
  type NewStudySession = {
    date : Text;
    studySeconds : Nat;
    breakSeconds : Nat;
    stopCount : Nat;
  };

  type NewTodoItem = {
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

  type NewUserData = {
    todos : Map.Map<Nat, NewTodoItem>;
    dailySessions : Map.Map<Text, NewStudySession>;
    nextTodoId : Nat;
    subjects : Map.Map<Text, Subject>;
    topics : Map.Map<Text, Topic>;
    nextSubjectId : Nat;
    nextTopicId : Nat;
  };

  type NewActor = {
    userData : Map.Map<Principal, NewUserData>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserData = old.userData.map<Principal, OldUserData, NewUserData>(
      func(_principal, oldUserData) {
        {
          oldUserData with
          subjects = Map.empty<Text, Subject>();
          topics = Map.empty<Text, Topic>();
          nextSubjectId = 0;
          nextTopicId = 0;
        };
      }
    );
    { userData = newUserData };
  };
};

