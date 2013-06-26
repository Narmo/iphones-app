//
//  IPAppDelegate.m
//  iPhones News
//
//  Created by Sergey Chikuyonok on 3/19/13.
//  Copyright (c) 2013 Sergey Chikuyonok. All rights reserved.
//

#import "IPAppDelegate.h"
#import "IPViewController.h"

NSUInteger DeviceSystemMajorVersion();

@implementation IPAppDelegate

void uncaughtExceptionHandler(NSException *exception) {
	TRACE(@"CRASH: %@", exception);
	TRACE(@"Stack Trace: %@", [exception callStackSymbols]);
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
	NSSetUncaughtExceptionHandler(&uncaughtExceptionHandler);
	
	// update User Agent
	NSDictionary *uaPrefs = [NSDictionary dictionaryWithObjectsAndKeys:@"iPhones News", @"UserAgent", nil];
	[[NSUserDefaults standardUserDefaults] registerDefaults:uaPrefs];
	
	if (DeviceSystemMajorVersion() >= 7) {
		application.statusBarStyle = UIStatusBarStyleDefault;
	}
	
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
	self.window.backgroundColor = [UIColor whiteColor]; // RGB(235, 235, 235);
	self.viewController = [[IPViewController alloc] init];
	self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
}

- (void)applicationWillTerminate:(UIApplication *)application {
}

@end
