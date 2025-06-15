# Code Explanation Script

## Chapter 1: Files in this chapter (5s)

This chapter covers the following files:
app/src/main/java/com/example/gkrinker/sunny/MyActivity.java

---

## Scene 1: Scene 1: Setting the Stage with Imports (20s)

To start our journey through the `MyActivity.java` file, let's look at the imports. Imports in Java are like a toolbox; they bring in all the tools we need to build our application.


### Code Highlights

**MyActivity.java** (lines 1-16):
```
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.support.v7.app.ActionBarActivity;
import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.io.BufferedReader;
```
These lines import various classes and interfaces that provide the necessary functionality for things such as networking, user interface components, and data handling.



---

## Scene 2: Scene 2: The Heart of the Activity - onCreate Method (25s)

In this scene, we're diving into the `onCreate` method, which is like the constructor for activities. It's where the initial setup happens.


### Code Highlights

**MyActivity.java** (lines 19-26):
```
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_my);
    if (savedInstanceState == null) {
        getSupportFragmentManager().beginTransaction()
                .add(R.id.container, new ForecastFragment())
                .commit();
    }
}
```
- `setContentView(R.layout.activity_my);`: This line sets the user interface layout for the activity.
- `getSupportFragmentManager()...commit();`: This adds a new fragment to the activity. Think of fragments as reusable components of the UI.



---

## Scene 3: Scene 3: Creating the Options Menu (20s)

Next, let's explore how the options menu is created within the activity. This menu is like a toolbar giving options to the user.


### Code Highlights

**MyActivity.java** (lines 29-33):
```
@Override
public boolean onCreateOptionsMenu(Menu menu) {
    getMenuInflater().inflate(R.menu.my, menu);
    return true;
}
```
- `getMenuInflater().inflate(R.menu.my, menu);`: This inflates the menu resource, adding items to the action bar if it's present. It's like blowing up a balloon to make it visible.



---

## Scene 4: Scene 4: Handling Menu Selections (25s)

Let's see how the application reacts when a user selects an item from the menu. This is akin to handling a user's choice.


### Code Highlights

**MyActivity.java** (lines 36-49):
```
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    int id = item.getItemId();
    if (id == R.id.action_settings) {
        Intent navigateToSettings = new Intent(this, SettingsActivity.class);
        startActivity(navigateToSettings);
        return true;
    }
    else if (id== R.id.action_view_location){
        openMap();
    }
    return super.onOptionsItemSelected(item);
}
```
- `Intent navigateToSettings = new Intent(this, SettingsActivity.class);`: Creates an intent to start another activity, like passing a note to someone saying "Go to Settings".
- `openMap();`: Calls a method to open a map, which we'll explore next.



---

## Scene 5: Scene 5: The openMap Method - Navigating to a Location (30s)

Finally, let's examine the `openMap` method. This is where the action of opening a map with a specified location takes place.


### Code Highlights

**MyActivity.java** (lines 51-68):
```
private void openMap(){
    final String Q = "q";
    SharedPreferences sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
    String location = sharedPrefs.getString(
            getString(R.string.pref_location_key),
            getString(R.string.pref_location_default));
    Intent intent = new Intent(Intent.ACTION_VIEW);
    Uri geolocation = Uri.parse("geo:0,0").buildUpon().appendQueryParameter(Q,location).build();
    intent.setData(geolocation);
    if (intent.resolveActivity(getPackageManager()) != null) {
        startActivity(intent);
    }
    else{
        Log.d("Main", "Couldn't open a map with location");
    }
}
```
- `SharedPreferences sharedPrefs = ...`: Retrieves the user's location preference, similar to checking a note for the address.
- `Uri geolocation = Uri.parse("geo:0,0")...`: Constructs a URI to represent the geographical location.
- `startActivity(intent);`: Launches the map application, like opening a map to the specified location.


---

