import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:suraksha_app/theme/app_theme.dart';
import 'package:suraksha_app/screens/home_screen.dart';
import 'package:suraksha_app/screens/alerts_screen.dart';
import 'package:suraksha_app/services/mock_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        Provider(create: (_) => MockService()),
      ],
      child: const SurakshaApp(),
    ),
  );
}

class SurakshaApp extends StatelessWidget {
  const SurakshaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Suraksha SDK',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const AlertsScreen(),
    const Center(child: Text('Settings')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        selectedItemColor: AppTheme.primaryNavy,
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'HOME'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications), label: 'ALERTS'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'SETTINGS'),
        ],
      ),
      floatingActionButton: _selectedIndex != 1 
          ? FloatingActionButton(
              onPressed: () {},
              backgroundColor: AppTheme.accentRed,
              child: const Icon(Icons.emergency_share, color: Colors.white),
            )
          : null,
    );
  }
}
