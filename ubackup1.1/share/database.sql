CREATE DATABASE ubackup
CHARACTER SET utf8
COLLATE utf8_general_ci;

use ubackup;

create table users
(
  userID INT UNSIGNED AUTO_INCREMENT NOT NULL,
  username varchar(60) NOT NULL,
  password VARCHAR(60) NOT NULL,
  userType INT8 UNSIGNED NOT NULL DEFAULT 0,
  lastLoginTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  loginCount INT NOT NULL DEFAULT 0,
  PRIMARY KEY (userID)
);

create table systems
(
  systemID INT UNSIGNED AUTO_INCREMENT NOT NULL,
  systemDescribe varchar(180) default '未写描诉',
  userID INT UNSIGNED NOT NULL,
  systemName VARCHAR(60) NOT NULL,
  frequency float,
  endtime bigint,
  PRIMARY KEY (systemID),
  foreign key(userID) references users(userID) on delete CASCADE on update CASCADE
);

create table devices
 (
   deviceID INT UNSIGNED AUTO_INCREMENT NOT NULL,
   userID INT UNSIGNED NOT NULL,
   systemID INT UNSIGNED NOT NULL,
   deviceName VARCHAR(60) NOT NULL,
   deviceType INT UNSIGNED NOT NULL,
   ip VARCHAR(20) NOT NULL,
   deviceUsername VARCHAR(60) NOT NULL,
   devicePassword varchar(60) NOT NULL,
   devicePort int unsigned not null,
   frequency float,
   endtime bigint,
   PRIMARY KEY (deviceID),
   INDEX deviceTypeIndex (deviceType),
   foreign key(userID) references users(userID) on delete CASCADE on update CASCADE,
   foreign key(systemID) references systems(systemID) on delete CASCADE on update CASCADE
 );

 create table files
 (
   fileID INT UNSIGNED AUTO_INCREMENT NOT NULL,
   userID INT UNSIGNED NOT NULL,
   systemID INT UNSIGNED NOT NULL,
   deviceID INT UNSIGNED NOT NULL,
   fileType INT UNSIGNED NOT NULL,
   filename VARCHAR(60) NOT NULL,
   remotePath VARCHAR(180),
   localPath varchar(300) not null,
   filenameOnPath varchar(240),
   routeCommand varchar(60),
   identifyKeywords varchar(60),
   frequency float,
   endtime bigint,
   PRIMARY KEY (fileID),
   foreign key(userID) references users(userID) on delete CASCADE on update CASCADE,
   foreign key(systemID) references systems(systemID) on delete CASCADE on update CASCADE,
   foreign key(deviceID) references devices(deviceID) on delete CASCADE on update CASCADE
 );

 create table tasks
 (
    taskID INT UNSIGNED AUTO_INCREMENT NOT NULL,
    userID INT UNSIGNED NOT NULL,
    systemID INT UNSIGNED NOT NULL,
    deviceID INT UNSIGNED NOT NULL,
    fileID INT UNSIGNED NOT NULL,
    taskTime bigint NOT NULL,
    state INT NOT NULL,
    priority int unsigned not null default 1,
    count INT UNSIGNED NOT NULL default 3,
    newName varchar(300),
    progress varchar(300),
    shift int unsigned not null default 0,
    progressIsDone int unsigned not null default 0,
    script mediumtext,
    PRIMARY KEY (taskID),
    foreign key(userID) references users(userID) on delete CASCADE on update CASCADE,
    foreign key(systemID) references systems(systemID) on delete CASCADE on update CASCADE,
    foreign key(deviceID) references devices(deviceID) on delete CASCADE on update CASCADE,
    foreign key(fileID) references files(fileID) on delete CASCADE on update CASCADE
 );

create table tasksHistory
 (
    taskHistoryID INT UNSIGNED AUTO_INCREMENT NOT NULL,
    userID INT UNSIGNED NOT NULL,
    systemID INT UNSIGNED NOT NULL,
    deviceID INT UNSIGNED NOT NULL,
    fileID INT UNSIGNED NOT NULL,
    newName varchar(300) not null,
    taskTime bigint NOT NULL,
    state INT NOT NULL,
    notice int not null default 0,
    progress varchar(300),
    script mediumtext,
    foreign key(userID) references users(userID) on delete CASCADE on update CASCADE,
    foreign key(systemID) references systems(systemID) on delete CASCADE on update CASCADE,
    foreign key(deviceID) references devices(deviceID) on delete CASCADE on update CASCADE,
    foreign key(fileID) references files(fileID) on delete CASCADE on update CASCADE,
    PRIMARY KEY (taskHistoryID)
 );

create table fileMes
(
    fileMesID INT UNSIGNED AUTO_INCREMENT NOT NULL,
    userID INT UNSIGNED NOT NULL,
    systemID INT UNSIGNED NOT NULL,
    deviceID INT UNSIGNED NOT NULL,
    fileID INT UNSIGNED NOT NULL,
    data longblob,
    PRIMARY KEY (fileMesID)
);

alter table users AUTO_INCREMENT = 10000;
alter table systems AUTO_INCREMENT = 10000;
alter table devices AUTO_INCREMENT = 10000;
alter table files AUTO_INCREMENT = 10000;
alter table tasks AUTO_INCREMENT = 1000000;
alter table tasksHistory AUTO_INCREMENT = 1000000;
alter table fileMes AUTO_INCREMENT = 1000000;