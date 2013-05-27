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

static NSString *const kTrackingId = @"UA-115285-4";

@interface IPViewController ()
- (void)unpackEngine;
- (void)showSplash;
- (void)hideSplash;
@end

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

- (void)viewDidLoad
{
    [super viewDidLoad];
	
	[self showSplash];
	
	[self unpackEngine];
	
	self.webview.delegate = self;
	self.webview.dataDetectorTypes = UIDataDetectorTypeNone;
	self.webview.scrollView.scrollEnabled = NO;
	
	// set-up tracker
	#ifdef DEBUG
	[GAI sharedInstance].debug = YES;
	#endif
	[GAI sharedInstance].dispatchInterval = 60;
	[GAI sharedInstance].trackUncaughtExceptions = YES;
	self.tracker = [[GAI sharedInstance] trackerWithTrackingId:kTrackingId];
	
	
	[[NSNotificationCenter defaultCenter] addObserverForName:UIKeyboardWillShowNotification object:nil queue:nil usingBlock:^(NSNotification *note) {
		self.webview.scrollView.contentInset = UIEdgeInsetsZero;
		[self performSelector:@selector(removeBar) withObject:nil afterDelay:0];
	}];


	NSString *mainFile = [CACHEPATH stringByAppendingPathComponent:@"index.html"];
	if (mainFile) {
		NSURLRequest *req = [NSURLRequest requestWithURL:[NSURL fileURLWithPath:mainFile]];
		[self.webview loadRequest:req];
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

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewDidUnload {
    [self setWebview:nil];
    [super viewDidUnload];
}

- (BOOL)           webView:(UIWebView *)webView
shouldStartLoadWithRequest:(NSURLRequest *)request
			navigationType:(UIWebViewNavigationType)navigationType {
	
	NSURL *url = [request URL];
	if ([[url scheme] isEqualToString:@"analytics"]) {
		if ([url.host isEqualToString:@"_trackPageview"]) {
			TRACE(@"Logging %@", url.path);
			[self.tracker trackView:url.path];
        }
	} else if ([[url scheme] isEqualToString:@"app"]) {
		TRACE(@"App command %@", url.host);
		if ([url.host isEqualToString:@"hide-splash"]) {
			[self hideSplash];
		}
		return NO;
	} else if (![url isFileURL]) {
		if ([[url absoluteString] hasPrefix:@"http://www.iphones.ru/iNotes/"]) {
			NSString *postId = [url lastPathComponent];
			NSString *resp = [self.webview stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"require('eventHandler').handle('show_post:%@')", postId]];
			
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
	self.splash = [[UIView alloc] initWithFrame:self.view.frame];
	
	NSString *img = @"Default";
	if ([UIScreen mainScreen].bounds.size.height == 568.0) {
		img = @"Default-568h";
	}
	
	TRACE(@"Image: %@", img);
	
	UIImageView *splashImage = [[UIImageView alloc] initWithImage:[UIImage imageNamed:img]];
	splashImage.frame = CGRectMake(0.0, -[UIApplication sharedApplication].statusBarFrame.size.height, splashImage.frame.size.width, splashImage.frame.size.height);
	
	UIActivityIndicatorView *loader = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
	loader.frame = CGRectMake(120.0, 320, 80.0, 80.0);
	[self.splash addSubview:splashImage];
	[self.splash addSubview:loader];
	[loader startAnimating];
	
	[self.view addSubview:self.splash];
}

- (void)hideSplash {
	[UIView
	 animateWithDuration:0.3
	 animations:^{
		 self.splash.alpha = 0.0;
	 }
	 completion:(void (^)(BOOL)) ^{
		 for (UIView *v in self.splash.subviews) {
			 if ([v respondsToSelector:@selector(stopAnimating)]) {
				 [v performSelector:@selector(stopAnimating)];
			 }
		 }
		 [self.splash removeFromSuperview];
		 self.splash = nil;
	 }];
}

@end
