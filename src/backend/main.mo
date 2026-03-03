import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  //---------------------
  // Types & Comparators
  //---------------------
  type Subject = {
    id : Nat;
    name : Text;
    description : Text;
    iconEmoji : Text;
    colorTag : Text;
    order : Nat;
  };

  type Topic = {
    id : Nat;
    subjectId : Nat;
    title : Text;
    videoUrl : Text;
    notes : Text;
    order : Nat;
  };

  type Bookmark = {
    userId : Principal;
    topicId : Nat;
  };

  type RecentlyWatched = {
    userId : Principal;
    topicId : Nat;
    watchedAt : Int;
    videoPositionSeconds : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  module PrincipalNat {
    public func compare(a : (Principal, Nat), b : (Principal, Nat)) : Order.Order {
      switch (Principal.compare(a.0, b.0)) {
        case (#equal) {
          Nat.compare(a.1, b.1);
        };
        case (order) {
          order;
        };
      };
    };
  };

  //-----------
  // Persistent Storage
  //-----------
  let subjects = Map.empty<Nat, Subject>();
  let topics = Map.empty<Nat, Topic>();
  let bookmarks = Set.empty<(Principal, Nat)>();
  let recentlyWatched = Map.empty<(Principal, Nat), RecentlyWatched>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  //-----------
  // Authorization Component
  //-----------
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //-------------------
  // User Profile Management
  //-------------------
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  //-------------------
  // Subjects CRUD (Admin only)
  //-------------------
  public shared ({ caller }) func createSubject(subject : Subject) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create subjects");
    };
    subjects.add(subject.id, subject);
  };

  public shared ({ caller }) func updateSubject(subject : Subject) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update subjects");
    };
    subjects.add(subject.id, subject);
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete subjects");
    };
    subjects.remove(id);
  };

  //----------------------
  // Topics CRUD (Admin only)
  //----------------------
  public shared ({ caller }) func createTopic(topic : Topic) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create topics");
    };
    topics.add(topic.id, topic);
  };

  public shared ({ caller }) func updateTopic(topic : Topic) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update topics");
    };
    topics.add(topic.id, topic);
  };

  public shared ({ caller }) func deleteTopic(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete topics");
    };
    topics.remove(id);
  };

  //-------------------
  // Public Queries
  //-------------------
  public query func getAllSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  public query func getTopicsBySubject(subjectId : Nat) : async [Topic] {
    topics.values().toArray().filter(
      func(topic) { topic.subjectId == subjectId }
    );
  };

  public query func searchTopicsByKeyword(keyword : Text) : async [Topic] {
    let lowerKeyword = keyword.toLower();
    topics.values().toArray().filter(
      func(topic) {
        topic.title.toLower().toText().contains(#text(lowerKeyword));
      }
    );
  };

  //-------------------
  // Bookmarks
  //-------------------
  public shared ({ caller }) func addBookmark(topicId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bookmarks");
    };

    bookmarks.add((caller, topicId));
  };

  public shared ({ caller }) func removeBookmark(topicId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove bookmarks");
    };

    bookmarks.remove((caller, topicId));
  };

  public query ({ caller }) func getBookmarks() : async [Bookmark] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get bookmarks");
    };

    bookmarks.values().toArray().filter(
      func(bookmark) { bookmark.0 == caller }
    ).map(
      func(bookmark) : Bookmark {
        {
          userId = bookmark.0;
          topicId = bookmark.1;
        };
      }
    );
  };

  //-------------------
  // Recently Watched
  //-------------------
  public shared ({ caller }) func recordRecentlyWatched(topicId : Nat, videoPositionSeconds : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record recently watched topics");
    };

    let entry = {
      userId = caller;
      topicId;
      watchedAt = Time.now();
      videoPositionSeconds;
    };

    recentlyWatched.add((caller, topicId), entry);
  };

  public query ({ caller }) func getRecentlyWatched() : async [RecentlyWatched] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get recently watched topics");
    };

    let entries = recentlyWatched.values().toArray().filter(
      func(rw) { rw.userId == caller }
    ).sort(func(a : RecentlyWatched, b : RecentlyWatched) : Order.Order {
      Int.compare(b.watchedAt, a.watchedAt) // Descending order
    });

    let limit = Nat.min(entries.size(), 20);
    if (entries.size() > limit) {
      Array.tabulate<RecentlyWatched>(limit, func(i) { entries[i] });
    } else { entries };
  };
};
