import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:suraksha_app/models/models.dart';
import 'package:suraksha_app/services/mock_service.dart';
import 'package:suraksha_app/theme/app_theme.dart';
import 'package:suraksha_app/widgets/train_card.dart';
import 'package:suraksha_app/widgets/safety_widgets.dart';
import 'package:suraksha_app/screens/train_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedFilter = 'ALL';
  final List<String> _filters = ['ALL', 'WESTERN LINE', 'CENTRAL LINE', 'HARBOUR LINE', 'INTERCITY'];

  @override
  Widget build(BuildContext context) {
    final mockService = Provider.of<MockService>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  const Text(
                    'LIVE STATION',
                    style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    _getStationName(),
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(height: 16),
                  _buildSearchField(),
                  const SizedBox(height: 16),
                  _buildFilterChips(),
                  const AlertBanner(
                    title: 'AVOID PLATFORM 8',
                    message: 'Excessive crowd due to Kalyan Slow delay',
                  ),
                ],
              ),
            ),
          ),
          FutureBuilder<List<TrainModel>>(
            future: mockService.getTrains(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              if (snapshot.hasError) {
                return const SliverFillRemaining(
                  child: Center(child: Text('Error loading trains')),
                );
              }

              final trains = snapshot.data ?? [];
              final filteredTrains = _selectedFilter == 'ALL'
                  ? trains
                  : trains.where((t) => t.routeTag == _selectedFilter).toList();

              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index < filteredTrains.length) {
                        return TrainCard(
                          train: filteredTrains[index],
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => TrainDetailScreen(train: filteredTrains[index]),
                            ),
                          ),
                        );
                      } else if (index == filteredTrains.length) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24.0),
                          child: Text(
                            'LIVE SAFETY INSIGHTS',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                          ),
                        );
                      } else {
                        return _buildSafetyInsights();
                      }
                    },
                    childCount: filteredTrains.length + 2,
                  ),
                ),
              );
            },
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }
  String _getStationName() {
    switch (_selectedFilter) {
      case 'WESTERN LINE':
        return 'Andheri Station';
      case 'CENTRAL LINE':
        return 'Mumbai CSMT';
      case 'HARBOUR LINE':
        return 'Vashi Station';
      case 'INTERCITY':
        return 'Pune Junction';
      default:
        return 'Andheri Station';
    }
  }


  Widget _buildAppBar() {
    return SliverAppBar(
      pinned: true,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Row(
        children: [
          const Icon(Icons.security, color: AppTheme.primaryNavy),
          const SizedBox(width: 8),
          const Text(
            'SURAKSHA',
            style: TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
          ),
          const Spacer(),
          IconButton(onPressed: () {}, icon: const Icon(Icons.wifi_tethering, color: AppTheme.primaryNavy)),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const TextField(
        decoration: InputDecoration(
          icon: Icon(Icons.search, color: Colors.grey),
          hintText: 'Search Train Number or Name...',
          border: InputBorder.none,
          hintStyle: TextStyle(color: Colors.grey),
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final isSelected = _selectedFilter == _filters[index];
          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = _filters[index]),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryNavy : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _filters[index],
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.black54,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSafetyInsights() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Expanded(
          flex: 2,
          child: SafetyInsightCard(
            title: 'CSMT Main Concourse is currently at peak capacity.',
            description: 'Use the East Exit (D\'Mello Road) for a faster exit. Platforms 1-6 are moderately free.',
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          flex: 1,
          child: Column(
            children: [
              const SafetyInsightCard(
                isSOS: true,
                title: 'One-Tap SOS',
                description: 'Immediate GRP Alert',
              ),
              const SizedBox(height: 12),
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(24),
                ),
                padding: const EdgeInsets.all(16),
                child: const Column(
                  children: [
                    Icon(Icons.group, color: Colors.grey),
                    SizedBox(height: 8),
                    Text('ACTIVE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey)),
                    Spacer(),
                    Text('Volunteer Network', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('24 Guardians nearby', style: TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
