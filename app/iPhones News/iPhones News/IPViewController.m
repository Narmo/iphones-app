//
//  IPViewController.m
//  iPhones News
//
//  Created by Sergey Chikuyonok on 3/19/13.
//  Copyright (c) 2013 Sergey Chikuyonok. All rights reserved.
//

#import "IPViewController.h"
#import "ZKDefs.h"
#import "ZKFileArchive.h"
#import "ZKDataArchive.h"
#import "ZKCDHeader.h"
#import "GAI.h"
#import "XQueryComponents.h"

static NSString *const kTrackingId = @"UA-115285-4";

@implementation IPViewController

- (void)unpackEngine {
	ZKFileArchive *archive = [ZKFileArchive archiveWithArchivePath:[[NSBundle mainBundle] pathForResource:@"app" ofType:@"zip"]];
	
	// Clean-up old files to make sure that new ones won’t break them
	NSFileManager *fm = [NSFileManager defaultManager];
	for (ZKCDHeader *cdHeader in archive.centralDirectory) {
		NSString *fullPath = [CACHEPATH stringByAppendingPathComponent:cdHeader.filename];
		[fm removeItemAtPath:fullPath error:nil];
	}
	
	NSInteger result = [archive inflateToDirectory:CACHEPATH usingResourceFork:NO];
	if (result != zkSucceeded) {
		TRACE(@"ERROR UNPACKING ENGINE!!!");
	}
}

- (void)viewDidLoad {
    [super viewDidLoad];
	
	CACHEPATH = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0];
	
	[self showSplash];
	[self unpackEngine];
	
	mWebView = [[UIWebView alloc] initWithFrame:self.view.bounds];
	mWebView.delegate = self;
	mWebView.dataDetectorTypes = UIDataDetectorTypeNone;
	mWebView.scrollView.scrollEnabled = NO;
	[self.view insertSubview:mWebView atIndex:0];
	
	// set-up tracker
#ifdef DEBUG
	[GAI sharedInstance].debug = YES;
#endif
	[GAI sharedInstance].dispatchInterval = 60;
	[GAI sharedInstance].trackUncaughtExceptions = YES;
	self.tracker = [[GAI sharedInstance] trackerWithTrackingId:kTrackingId];
	
	[[NSNotificationCenter defaultCenter] addObserverForName:UIKeyboardWillShowNotification object:nil queue:nil usingBlock:^(NSNotification *note) {
		mWebView.scrollView.contentInset = UIEdgeInsetsZero;
		[self removeBar];
	}];
	
	NSString *mainFile = [CACHEPATH stringByAppendingPathComponent:@"index.html"];
	if (mainFile) {
		NSURLRequest *req = [NSURLRequest requestWithURL:[NSURL fileURLWithPath:mainFile]];
		[mWebView loadRequest:req];
	}
}

- (void)removeBar {
	// Locate non-UIWindow.
	UIWindow *keyboardWindow = nil;
	for (UIWindow *testWindow in [[UIApplication sharedApplication] windows]) {
		if (![[testWindow class] isEqual:[UIWindow class]]) {
			keyboardWindow = testWindow;
			break;
		}
	}
	
	// Locate UIWebFormView.
	for (UIView *formView in [keyboardWindow subviews]) {
		// iOS 5 sticks the UIWebFormView inside a UIPeripheralHostView.
		if ([[formView description] rangeOfString:@"UIPeripheralHostView"].location != NSNotFound) {
			for (UIView *subView in [formView subviews]) {
				if ([[subView description] rangeOfString:@"UIWebFormAccessory"].location != NSNotFound) {
					// remove the input accessory view
					[subView removeFromSuperview];
				}
				else if([[subView description] rangeOfString:@"UIImageView"].location != NSNotFound){
					// remove the line above the input accessory view (changing the frame)
					[subView setFrame:CGRectZero];
				}
			}
		}
    }
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
	NSURL *url = [request URL];
	if ([[url scheme] isEqualToString:@"analytics"]) {
		if ([url.host isEqualToString:@"_trackPageview"]) {
			TRACE(@"Logging %@", url.path);
			[self.tracker trackView:url.path];
        }
	}
	else if ([[url scheme] isEqualToString:@"app"]) {
		TRACE(@"App command %@", url.host);
		if ([url.host isEqualToString:@"hide-splash"]) {
			[self hideSplash];
		} else if ([url.host isEqualToString:@"external"]) {
			NSDictionary *query = [url queryComponents];
			if ([query objectForKey:@"app_url"]) {
				NSArray *appUrlValue = (NSArray *)[query objectForKey:@"app_url"];
				NSURL *launchUrl = [NSURL URLWithString:[appUrlValue objectAtIndex:0]];
				
				if ([[UIApplication sharedApplication] canOpenURL:launchUrl]) {
					[[UIApplication sharedApplication] openURL:launchUrl];
				} else if ([query objectForKey:@"fallback_url"]) {
					NSArray *fallbackUrlValue = (NSArray *)[query objectForKey:@"fallback_url"];
					TRACE(@"Fallback: %@", [fallbackUrlValue objectAtIndex:0]);
					[[UIApplication sharedApplication] openURL:[NSURL URLWithString:[fallbackUrlValue objectAtIndex:0]]];
				}
				
//				TRACE(@"App URL: %@, fallback URL: %@", [query objectForKey:@"app_url"], [query objectForKey:@"fallback_url"]);
			}
		}
		return NO;
	}
	else if (![url isFileURL]) {
		if ([[url absoluteString] hasPrefix:@"http://www.iphones.ru/iNotes/"]) {
			NSString *postId = [url lastPathComponent];
			NSString *resp = [mWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"require('eventHandler').handle('show_post:%@')", postId]];
			
			if (![resp isEqualToString:@"0"]) {
				return NO;
			}
		}
		
		if (navigationType == UIWebViewNavigationTypeLinkClicked) {
			if (![[UIApplication sharedApplication] openURL:url]) {
				TRACE(@"%@%@",@"Failed to open url:",[url description]);
			}
			
			return NO;
		}
	}
	
	return YES;
}

- (void)showSplash {
	if (splashView) {
		return;
	}
	
	NSString *imgName = nil;
	if ([UIScreen mainScreen].bounds.size.height == 568.0) {
		imgName = @"Default-568h";
	}
	else {
		imgName = @"Default";
	}

	UIImageView *splash = [[UIImageView alloc] initWithImage:[UIImage imageNamed:imgName]];
	CGRect frame = splash.bounds;
	frame.origin.y = -[UIApplication sharedApplication].statusBarFrame.size.height;
	splash.frame = frame;

	UIActivityIndicatorView *loader = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	loader.frame = CGRectMake(120.0, 320, 80.0, 80.0);
	[splash addSubview:loader];
	[loader startAnimating];
	[self.view addSubview:splash];
	
	splashView = splash;
}

- (void)hideSplash {
	[UIView
	 animateWithDuration:0.3
	 animations:^{
		 splashView.alpha = 0.0;
	 }
	 completion:(void (^)(BOOL)) ^{
		 [splashView removeFromSuperview];
		 splashView = nil;
	 }];
}

- (BOOL)shouldAutorotate {
	return NO;
}

- (void)dealloc {
	CACHEPATH = nil;
	self.tracker = nil;
}

@end
